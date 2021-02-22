import { Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(async (ctx, next) => {
    console.log(ctx.message);
    await next();
});
bot.on('text', async (ctx, next) => {
    console.log(`message from ${ctx.message.from.username} '${ctx.message.text}'`);
    await next();
});

bot.start(ctx => ctx.reply('Ну привет, епта'));

bot.hears(/.*/, async (ctx, next) => {
    const name = ctx.message.from.first_name;
    setTimeout(() => ctx.reply(`Пошел нахуй, ${name}!!!`, {disable_notification: false}), 5000);
    await next();
});


bot.hears(/please/, ctx => {
    ctx.reply(`пожалуйста`);
});

bot.hears('dice', ctx => {
    ctx.replyWithDice();
});


bot.launch()
    .then(() => console.info('Bot was started'))
    .catch( error => console.error('Error starting bot', error));
