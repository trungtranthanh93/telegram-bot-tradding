const { Telegraf } = require('telegraf');

const bot = new Telegraf('1915531611:AAGlXQMfyhCdd1ndGT_pVHidSb8zY-Rb9qI');
bot.command('getId', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, "Id of Group or Channel is: " + ctx.chat.id, {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));
// Lấy telegram groupid bằng url
// https://api.telegram.org/bot1740325065:AAEixtBO5zu__F5S44iiG-tkP-DuBoTUpiY/getUpdates
// https://api.telegram.org/bot1740325065:AAGNCtKTLmsYpkmQOG_HlU7TuDxHIxouGgg/getUpdates

bot.telegram.sendMessage(-1001506649568, "Bot tiến hành khởi động lại. Nhận tín hiệu từ Bot tín hiệu 3"); // Gửi tin nhắn 
module.exports = bot;



