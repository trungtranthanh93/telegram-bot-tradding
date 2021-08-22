const { Telegraf } = require('telegraf');

const bot = new Telegraf('1977842671:AAFqHNqFF8kbwS71krkcViK0wjgUbZFVmHo'); // tradding_4341_bot
bot.command('getId', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, "Id of Group or Channel is: " + ctx.chat.id, {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));
// Lấy telegram groupid bằng url
// https://api.telegram.org/bot1740325065:AAEixtBO5zu__F5S44iiG-tkP-DuBoTUpiY/getUpdates
// https://api.telegram.org/bot1740325065:AAGNCtKTLmsYpkmQOG_HlU7TuDxHIxouGgg/getUpdates

bot.telegram.sendMessage(-1001546623891, "Bot re-start"); // Gửi tin nhắn 
bot.launch();
module.exports = bot;



