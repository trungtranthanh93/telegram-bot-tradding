const { Telegraf } = require('telegraf');

const bot = new Telegraf('2059564462:AAG8fbcDId7kCx5000EeTBSFU_IGSvRqn5o'); // tradding_4341_bot
// 1988197681:AAHK5okW0zGFMV_3KlP1cwJRBRhoUK5D8Dk bot get id
bot.command('getId', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, "Id of Group or Channel is: " + ctx.chat.id, {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));
// Lấy telegram groupid bằng url
// https://api.telegram.org/bot1988197681:AAHK5okW0zGFMV_3KlP1cwJRBRhoUK5D8Dk/getUpdates
// https://api.telegram.org/bot2059564462:AAG8fbcDId7kCx5000EeTBSFU_IGSvRqn5o/getUpdates

bot.telegram.sendMessage(-1001562959180, "Bot tiến hành khởi động lại. Nhận tín hiệu từ Bot 5"); // Gửi tin nhắn 
bot.launch();
module.exports = bot;



