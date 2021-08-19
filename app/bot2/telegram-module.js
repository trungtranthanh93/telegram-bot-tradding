const { Telegraf } = require('telegraf');

// const bot = new Telegraf('1740325065:AAEixtBO5zu__F5S44iiG-tkP-DuBoTUpiY'); tradding-bot-2
const bot = new Telegraf('1972059217:AAGcQpSyzaezMuDk0gp9Z9dTm5jLSR5fZw0'); // tradding-bot
bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));
// Lấy telegram groupid bằng url
// https://api.telegram.org/bot1972059217:AAGcQpSyzaezMuDk0gp9Z9dTm5jLSR5fZw0/getUpdates

bot.telegram.sendMessage(-1001546623891, "Bot re-start"); // Gửi tin nhắn
module.exports = bot;



