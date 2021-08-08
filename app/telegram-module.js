const { Telegraf } = require('telegraf');

const bot = new Telegraf('1678619895:AAEIdcCuqPv6lGooqJq3NkKrALM0f1_SaoA');
bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));
// Lấy telegram groupid bằng url
// https://api.telegram.org/bot1678619895:AAEIdcCuqPv6lGooqJq3NkKrALM0f1_SaoA/getUpdates
bot.telegram.sendMessage(-516496456, "Bot re-start"); // Gửi tin nhắn
module.exports = bot;