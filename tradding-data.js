// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
const database = require('./app/database-module');
const cron = require('cron');
// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const { connect, ConsoleMessage } = require('puppeteer');
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: '2ce88ae4baadf2e5b36db0a6d1f6492a' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)
var lastResult = null; // 0: Xanh 1: Đỏ
var leftTime = null;

// puppeteer usage as normal
puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://pocinex.net/login')
    await page.type('input[name="email"]', 'trumikoran@gmail.com', { delay: 100 })
    await page.type('input[name="password"]', 'Trung12345678', { delay: 100 })
    await page.click('#main-content > div > div > div > div.boxAuthentication.show > div > div.formWapper.w-100 > form > div.form-group.text-center > button')
        // await page.goto('https://wefinex.net/login')
        // await page.type('input[type="email"]', 'trumikoran@gmail.com', { delay: 100 })
        // await page.type('input[type="password"]', '1zx2qwSa', { delay: 100 })
        // await page.click('button[type="submit"]')
        // That's it, a single line of code to solve reCAPTCHAs 🎉
    await page.solveRecaptchas()

    await Promise.all([
        page.waitForNavigation(),
    ])
    const job = new cron.CronJob({
        cronTime: '35 0/1 * * * *',
        onTick: async function() {
            await page.reload({ waitUntil: ["networkidle0"] });
        }
    });
    job.start()
    let cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    let result = `Kết quả bóng vừa rồi : Đỏ \u{2B06}`;
    let id = 1;
    count = 0;
    let countStaticData = 0;
    let communitiesId = 1;
    const printResponse = async function(cdp, response) {
        if (!response.response) {
            return;
        }
        let data = response.response.payloadData;
        if (data.includes("SOCKET_BO_LAST_RESULT") && data.includes("finalSide")) {
            console.log(response.requestId)
            let str = response.response.payloadData;
            console.log(str)
            if (id !== JSON.parse(str.substr(2, str.length))[1][0].id) {
                count = 0;
                id = JSON.parse(str.substr(2, str.length))[1][0].id;
            } else {
                count++;
            }
            if (count == 4) {
                let finalSide = JSON.parse(str.substr(2, str.length))[1][0].finalSide
                if (finalSide === "UP") {
                    lastResult = 0;
                    result = `Kết quả bóng vừa rồi : Xanh \u{1F34F}`
                } else if (finalSide === "DOWN") {
                    result = `Kết quả bóng vừa rồi : Đỏ \u{1F34E}`
                    lastResult = 1;
                } else if (finalSide === "NORMAL") {
                    result = `Kết quả bóng vừa rồi : Hòa`
                    lastResult = 2;
                }
                database.inserRessult(lastResult);
            }
        }
        if (data === "3") {
            console.log(data);
            countStaticData++;
        } else {
            countStaticData = 0;
        }
        if (countStaticData === 2) {
            console.log("Vao truong hop 4")
            cdp.detach();
            cdp = await page.target().createCDPSession();
            await cdp.send('Network.enable');
            await cdp.send('Page.enable');
            cdp.on('Network.webSocketFrameReceived', printResponse.bind(this, cdp));

        }
    }
    cdp.on('Network.webSocketFrameReceived', printResponse.bind(this, cdp)); // Fired when WebSocket message is received.
    // cdp.on('Network.webSocketFrameSent', printResponse); // Fired when WebSocket message is sent.
    cdp.on('Network.webSocketCreated', async(response) => {
        console.log("Vào webSocketCreated")
        console.log(response);
    })
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.leftTime = leftTime;
module.exports = puppeteer;
// startJob();