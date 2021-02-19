import { Telegraf } from 'telegraf';


const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new Telegraf(TOKEN);

bot.on('text', async (ctx, next) => {
    console.log(`message from ${ctx.message.from.username} '${ctx.message.text}'`);
    await next();
});

bot.start(ctx => ctx.reply('Ну привет, епта'));

bot.hears(/.*/, async (ctx, next) => {
    const name = ctx.message.from.username;
    await ctx.reply(`Пошел нахуй, @${name}!!!`);
    await next();
});

// bot.on('message', ctx => {
//    ctx.copyMessage(ctx.chat.id);
// });

bot.hears(/please/, ctx => {
    ctx.reply(`пожалуйста`);
});

bot.hears('dice', ctx => {
    ctx.replyWithDice();
});


bot.launch()
    .then(() => console.info('Bot was started'))
    .catch( error => console.error('Error starting bot', error));
