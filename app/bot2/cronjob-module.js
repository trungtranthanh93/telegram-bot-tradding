const cron = require('cron');
const bot = require('./telegram-module');
//const bot = require('../telegram-test2'); // k push
const database = require('../database-module');
var moment = require('moment');

// var message = "\u{1F600} Cho bot gửi thử ký tự đặc biệt và xuống dòng \n \u{1F359} Cho bot gửi thử ký tự đặc biệt và xuống dòng \n \u{2B06} Cho bot gửi thử ký tự đặc biệt và xuống dòng \n \u{2B07} Cho bot gửi thử ký tự đặc biệt và xuống dòng \n"
// message += "\u{1F55D} Đồng hồ, \u{2B06}  Tăng , \u{2B07} Giảm ,\u{1F389} Thắng , \u{274C} Thua , \u{267B} Thống kê, \u{1F4B0} Tiền";
//bot.telegram.sendMessage(-516496456, message);
// Link unicode của icon telegram : https://apps.timwhitlock.info/emoji/tables/unicode

const botId = 3;
const BOT_NAME = "Bot tín hiệu 2";
const RUNNING_STATUS = 1;
const STOPPING_STATUS = 0;
const DISABLE_STATUS = 3;
const capital = 100;
const WIN = "WIN";
const LOSE = "LOSE";
const NOT_ORDER = "NOT_ORDER";
const STATISTIC_TIME_AFTER = 10;
const NON_QUICK_ORDER = 0;
const QUICK_ORDER = 1;
const BUY = 0;
const SELL = 1;
const STOP_LOSS_VALUE = -7;
const TELEGRAM_CHANNEL_ID = -1001595893591; // kênh tín hiệu 2
//const TELEGRAM_CHANNEL_ID = -1001546623891; // group test
var isSentMessage = false;
var orderPrice = 1;
initSessionVolatility(botId);
var isFirst = true;
var isQuickOrder = NON_QUICK_ORDER;

async function startBot() {
    let timeInfo = await getCronTimeInfo();
    const job = new cron.CronJob({
        cronTime: timeInfo.cronTab,
        onTick: async function () {
            let result = await getLastDataTradding();
            let groupIds= await getGroupTelegramByBot(botId);
            if (!result) {
                if (!isSentMessage) {
                    sendToTelegram(groupIds, `BOT tạm ngưng do không lấy được dữ liệu`);
                    isSentMessage = true;
                }
                return;
            }
            isSentMessage = false;
            var dBbot = await getBotInfo(botId);
            if (dBbot.is_active === 0) {
                console.log("Bot dừng");
                return;
            }
            lastStatistics = await getLastStatistics(botId);
            if (!lastStatistics) {
                insertToStatistics(botId, NOT_ORDER, 0, 0, 0);
                return;
            }
            // lệnh gấp
            
            
            let currentTimeSecond = new Date().getSeconds();
            if (!isFirst && currentTimeSecond === parseInt(timeInfo.orderSecond) && isQuickOrder === QUICK_ORDER) {
                orderPrice = orderPrice * 2;
            }
            isFirst = false;
            if (currentTimeSecond === parseInt(timeInfo.orderSecond) || currentTimeSecond === (parseInt(timeInfo.orderSecond) + 1) || currentTimeSecond === (parseInt(timeInfo.orderSecond) + 2)) { // Vào lệnh
                if (dBbot.is_running === STOPPING_STATUS) {
                    return;
                }
                if (isQuickOrder === QUICK_ORDER) {
                } else if (database.checkRowOneForOrder()) {
                    console.log("Lệnh thường -> Chờ kết quả hàng thứ ba -> Không làm gì cả");
                    return;
                }
                var isNotOrder = false;
                if (isQuickOrder === NON_QUICK_ORDER) { // lệnh thường -> đánh theo hàng 1
                    if (lastStatistics.tradding_data === BUY) {
                        sendToTelegram(groupIds, `Hãy đánh ${orderPrice}$ lệnh Mua \u{2B06}`);
                        insertOrder(BUY, orderPrice, isQuickOrder, botId);
                    } else if (lastStatistics.tradding_data === SELL) {
                        sendToTelegram(groupIds, `Hãy đánh ${orderPrice}$ lệnh Bán \u{2B07}`);
                        insertOrder(SELL, orderPrice, isQuickOrder, botId);
                    } else {
                        isNotOrder = true;
                    }
                } else if (isQuickOrder === QUICK_ORDER) { // Lệnh gấp-> đánh theo lệnh vừa thua
                    let lastOrder = await getLastOrder(botId);
                    if (lastOrder.orders === BUY) {
                        sendToTelegram(groupIds, `Hãy đánh ${orderPrice}$ lệnh Mua \u{2B06}`);
                        insertOrder(BUY, orderPrice, isQuickOrder, botId);
                    } else if (lastOrder.orders === SELL) {
                        sendToTelegram(groupIds, `Hãy đánh ${orderPrice}$ lệnh Bán \u{2B07}`);
                        insertOrder(SELL, orderPrice, isQuickOrder, botId);
                    } else {
                        isNotOrder = true;
                    }
                }
                if (!isNotOrder) {
                    for (var i = 3; i > 0; i--) {
                        await sleep(1000);
                        sendToTelegram(groupIds, `Hãy đánh lệnh sau ${i} giây `);
                    }
                    await sleep(1000);
                    sendToTelegram(groupIds, `Chờ kết quả \u{1F55D} !`);
                }
            }
    
            if (currentTimeSecond === parseInt(timeInfo.resultSecond) || currentTimeSecond === (parseInt(timeInfo.resultSecond) + 1) || currentTimeSecond === (parseInt(timeInfo.resultSecond) + 2)) { // Update kết quả, Thống kê
                var budget = dBbot.budget;
                if (database.checkRowOneForStatistic() && isQuickOrder === NON_QUICK_ORDER) {
                    insertToStatistics(botId, NOT_ORDER, 0, parseInt(result.result), 0);
                    return;
                }
                if (dBbot.is_running === STOPPING_STATUS) {
                    console.log("Bot đang dừng -> Chỉ thống kê lệnh, không đánh");
                    insertToStatistics(botId, NOT_ORDER, 0, parseInt(result.result), 0);
                    return;
                }
    
                let order = await getOrder(botId);
                if (!order) {
                    return;
                }
                // THẮNG
                if (parseInt(result.result) === order.orders) {
                    var interest = orderPrice - orderPrice * 0.05;
                    budget = roundNumber(budget + interest, 2);
                    var percentInterest = interest / capital * 100;
                    sendToTelegram(groupIds, `Kết quả lượt vừa rồi : Thắng \u{1F389} \n\u{1F4B0}Số dư: ${budget}$ \n\u{1F4B0}Lãi : + ${interest}$ (+${percentInterest}%)\n\u{1F4B0}Vốn: ${capital}$`);
                    updateBugget(botId, budget);
                    if (isQuickOrder === QUICK_ORDER && orderPrice === 4) {
                        insertToStatistics(botId, WIN, QUICK_ORDER, parseInt(result.result), percentInterest);
                    } else {
                        insertToStatistics(botId, WIN, NON_QUICK_ORDER, parseInt(result.result), percentInterest);
                    }
                    
                    updateVolatiltyOfBot(botId, 0);
                    orderPrice = 1;
                    isQuickOrder = NON_QUICK_ORDER;
    
                } else { // THUA
                    var interest = -1 * orderPrice;
                    budget = roundNumber(budget + interest, 2);
                    var percentInterest = interest / capital * 100;
                    sendToTelegram(groupIds, `Kết quả lượt vừa rồi : Thua \u{274C} \n\u{1F4B0}Số dư: ${budget}$ \n\u{1F4B0}Lãi : ${interest}$ (${percentInterest}%)\n\u{1F4B0}Vốn: ${capital}$`);
                    updateBugget(botId, budget);
                    if (isQuickOrder === QUICK_ORDER && orderPrice === 4) {
                        insertToStatistics(botId, LOSE, QUICK_ORDER, parseInt(result.result), percentInterest);
                    } else {
                        insertToStatistics(botId, LOSE, NON_QUICK_ORDER, parseInt(result.result), percentInterest);
                    }
                    let volatility = dBbot.session_volatility + interest;
                    isQuickOrder = QUICK_ORDER;
                    if (volatility <= STOP_LOSS_VALUE && dBbot.is_running === RUNNING_STATUS) {
                        orderPrice = 1;
                        isQuickOrder = NON_QUICK_ORDER;
                        return;
                    }
                    updateVolatiltyOfBot(botId, volatility);
                }
    
                // Thống kê sau n lệnh
                await sleep(5000);
                let statisc = await statisticDay(botId, STATISTIC_TIME_AFTER);
                if (statisc) {
                    let sessionNumber = parseInt(statisc.length / STATISTIC_TIME_AFTER);
                    let statisticsMsg = [];
                    statisticsMsg.push(`\u{267B} Tổng kết ${STATISTIC_TIME_AFTER} lệnh:\n`);
                    let statisticalsTimeAfterStr = [];
                    let index = 1;
                    let winOrder = 0;
                    let lostOrder = 0;
                    let quickWinOrder = 0;
                    let quickLostOrder = 0;
                    let winOrderDay = 0;
                    let lostOrderDay = 0;
                    let quickWinOrderDay = 0;
                    let quickLostOrderDay = 0;
                    statisc.forEach(e => {
                        if (e.result === WIN) {
                            if (index <= STATISTIC_TIME_AFTER && e.is_statistics === 0) {
                                statisticalsTimeAfterStr.push(`${index}. \u{1F389} (${formatDateFromISO(e.created_time)}) Thắng +${e.interest} % \n`);
                                if (e.is_quick_order === NON_QUICK_ORDER) {
                                    winOrder++;
                                } else {
                                    quickWinOrder++;
                                }
                                index++;
                            }
                            if (e.is_quick_order === NON_QUICK_ORDER) {
                                winOrderDay++;
                            } else {
                                winOrderDay++;
                                quickWinOrderDay++;
                            }
                        } else {
                            if (index <= STATISTIC_TIME_AFTER && e.is_statistics === 0) {
                                statisticalsTimeAfterStr.push(`${index}. \u{274C} (${formatDateFromISO(e.created_time)}) Thua ${e.interest} % \n`);
                                if (e.is_quick_order === NON_QUICK_ORDER) {
                                    lostOrder++;
                                } else {
                                    quickLostOrder++;
                                }
                                index++;
                            }
                            if (e.is_quick_order === NON_QUICK_ORDER) {
                                lostOrderDay++;
                            } else {
                                quickLostOrderDay++;
                            }
                        }
                    });
                    let winLoseRatio = (winOrder + quickWinOrder * 2) * 0.95 - (lostOrder + quickLostOrder * 2);
    
                    statisticsMsg.push(`\u{267B} Phiên thứ ${sessionNumber} (+1) \n`);
                    statisticsMsg.push(`Kết quả : ${winLoseRatio}% \n`);
                    statisticsMsg = statisticsMsg.concat(statisticalsTimeAfterStr);
                    statisticsMsg.push(`------------------------------------------------\n`);
                    statisticsMsg.push(`Tổng số lệnh THẮNG (từ 00:00) là: ${winOrderDay}\n`);
                    statisticsMsg.push(`Tổng số lệnh thắng gấp (từ 00: 00) là : ${quickWinOrderDay} \n`);
                    statisticsMsg.push(`Tổng số lệnh thua gấp (từ 00: 00) là ${quickLostOrderDay}`);
                    sendToTelegram(groupIds, statisticsMsg.join(' '));
                    updateStatusForStatistics(botId);
                }
            }
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng 
    });
    job.start();
}

startBot();




async function getCronTimeInfo() {
    const ORDER_SETTING_TIME_KEY = "order.setting.second";
    const RESULT_SETTING_TIME_KEY = "result.setting.second";
    let orderSecond = await database.getSettingByKey(ORDER_SETTING_TIME_KEY);
    let resultSecond = await database.getSettingByKey(RESULT_SETTING_TIME_KEY);
    let cronTab = `${orderSecond.value},${resultSecond.value} * * * * *`;
    return {cronTab: cronTab, orderSecond: orderSecond.value, resultSecond: resultSecond.value}
} 

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function getData(ms) {
    return await database.getLastResult();
}
async function getBotInfo(botid) {
    return await database.getBotInfo(botid);
}

async function updateBugget(botid, bugdet) {
    return await database.updateBugget(botid, bugdet);
}

async function insertToStatistics(botid, result, isQuickOrder, traddingData, interest) {
    return await database.insertToStatistics(botid, result, isQuickOrder, traddingData, interest);
}

async function getLastStatistics(botid) {
    return await database.getLastStatistics(botid);
}

async function updateStatusForStatistics(botId) {
    return await database.updateStatusForStatistics(botId);
}

function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

async function statistic(botid, timeAfter) {
    return await database.statistic(botid, timeAfter);
}

async function statisticDay(botid, timeAfter) {
    return await database.statisticDay(botid, timeAfter);
}

function formatDateFromISO(date) {
    return moment(date.toString()).format("hh:mm:ss");
}

function checkRowOneForOrder() {
    var createdMinute = new Date().getMinutes();
    if (createdMinute % 2 === 0) {
        console.log("Hàng 1");
        return true;
    }
    console.log("Hàng 3");
    return false;
}

// Kiểm tra xem có phải đúng kết quả cuối hay không, khoảng cách giữa thời điểm hiện tại k dc dài hơn 1 phút so với kết quả trước đó
function isValidLastResult(lastStatistics) {
    var currentHour = new Date().getHours();
    var currentMinute = new Date().getMinutes();
    var createdDate = new Date(lastStatistics.created_time);
    var createdHour = createdDate.getHours();
    var createdMinute = createdDate.getMinutes();
    console.log(result);

    if (currentHour !== createdHour) {
        console.log("Không hợp lệ");
        return false;
    }
    console.log(currentMinute - createdMinute);
    if (currentMinute - createdMinute > 2) {
        console.log("Không hợp lệ");
        return false;
    }
    return true;
}

async function insertOrder(order, price, isQuickOrder, botId) {
    return await database.insertOrder(order, price, isQuickOrder, botId);
}

async function getOrder(botId) {
    let order = await database.getOrder(botId);
    if (!order) {
        return null;
    }
    let createdTime = new Date(order.created_time).getTime();
    let currrent = new Date().getTime();
    if ((currrent - createdTime) < 65000) { // nếu đúng là lệnh gần nhất
        return order;
    }
    return null;
}

async function initSessionVolatility(botId) {
    return await database.initSessionVolatility(botId);
}

async function updateVolatiltyOfBot(botId, volatility) {
    return await database.updateVolatiltyOfBot(botId, volatility);
}


async function getStatisticByLimit(botId, limit) {
    return await database.getStatisticByLimit(botId, limit);
}

async function getLastOrder(botId) {
    return await database.getLastOrder(botId);
}

async function getLastDataTradding() {
    let result = await getData();
    let currrent = new Date().getTime();
    if (!result) {
        return null;
    }
    if (((currrent - result.timestamp * 1000) > 35000)) { // kiểm tra trường hợp không lấy dc kết quả -> Tạm dừng
        return null;
    }
    return result;
}

async function getGroupTelegramByBot(botId) {
    return await database.getGroupTelegramByBot(botId);
}

async function sendToTelegram(groupIds, message) {
    bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID, message);
    let i = 0;
    groupIds.forEach(e => {
        i++;
        setTimeout(function () {
            bot.telegram.sendMessage(e.group_id, message);
        }, 200*i);
        
    });
}

module.exports = '';