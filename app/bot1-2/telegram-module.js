const { Telegraf } = require('telegraf');

const bot = new Telegraf('1948054009:AAHSG4Zthr8dpDr6xwBD6Shca1Ej6S1A-kI'); // tradding-bot
bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {})
});

bot.command('image', (ctx) => ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' }));

bot.telegram.sendMessage(-1001596882485, "Bot tiến hành khởi động lại. Nhận tín hiệu từ Bot tín hiệu 1.2"); // Gửi tin nhắn
module.exports = bot;



