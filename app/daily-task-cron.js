const cron = require('cron');
const bot = require('./telegram-module');
const database = require('./database-module');

bot.launch();

console.log(parseInt(101/10));
const job = new cron.CronJob({
    cronTime: '0 0 0 * * *',
    onTick: async function() {
        console.log("Migrate data vào đầu ngày");
        clearDataStatistic();
        clearDataOrders();
        clearData();
        initBot();
    },
    start: true,
    timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng 
});
job.start();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function clearDataStatistic() {
    return await database.clearDataStatistic();
}

async function clearDataOrders() {
    return await database.clearDataOrders();
}

async function clearData() {
    return await database.clearData();
}

async function initBot() {
    return await database.initBot();
}

module.exports = job;