import { Telegraf, session } from 'telegraf';
import { config } from 'dotenv';
import nodeHtmlToImage from 'node-html-to-image';
import { InputFileByBuffer } from 'telegraf/typings/telegram-types';
import ImageCharts from 'image-charts';
import axios from 'axios';

config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session());
bot.use(async (ctx, next) => {
    console.info('Update type', ctx.updateType);
    // console.log(JSON.stringify(ctx, null, 2));
    await next();
});
bot.on('text', async (ctx, next) => {
    console.log(`message from ${ctx.message.from.username} '${ctx.message.text}'`);
    await next();
});

bot.on('poll_answer', async (ctx, next) => {
    console.info(JSON.stringify(ctx.pollAnswer, null, 2));
    await next();
});

bot.on('location', async (ctx, next) => {
    console.info(JSON.stringify(ctx.message.location, null, 2));
    await next();
});

bot.start(ctx => {
    ctx.reply('Ну привет, епта');
});

bot.hears(/.*/, async (ctx, next) => {
    const name = ctx.message.from.first_name;
    ctx.replyWithChatAction('typing');
    // setTimeout(() => ctx.reply(`Пошел нахуй, ${name}!!!`, {disable_notification: false}), 5000);
    await next();
});


bot.hears(/please/, ctx => {
    ctx.reply(`пожалуйста`);
});

bot.command('dices', ctx => {
    ctx.replyWithDice();
});

bot.command('html', async (ctx, next) => {
    const img = await nodeHtmlToImage({html: `
<html>
    <head>
      <style>
        body {
          width: 200px;
          height: 200px;
        }
      </style>
    </head>
    <body>
<h1>Header</h1><table border="1"><tr><th>First col</th><th>Second col</th></tr><tr><td>aaaa</td><td>bbb</td></tr></table>
</body>
</html>
`});
    const photo: InputFileByBuffer = { source: <Buffer>img };
    ctx.replyWithPhoto(photo, {
        caption: 'Это какой-то текст HTML'
    });
});

bot.command('chart', async (ctx, next) => {
    const pie = new ImageCharts().cht('p').chd('a:2.5,5,8.3').chs('100x100');
    const buffer = await pie.toBuffer();
    const photo: InputFileByBuffer = { source: buffer };
    ctx.replyWithPhoto(photo);

});

bot.command('poll', ctx => {
   ctx.replyWithPoll('Кто сегодня мудак?', ['Вова', 'Маша', 'Федя'], {
       open_period: 15,
       is_anonymous: false
   });
});

bot.command('quiz', ctx => {
   ctx.replyWithQuiz('Кто сегодня мудак?', ['Вова', 'Маша', 'Федя'], {
       open_period: 15,
       is_anonymous: false,
       correct_option_id: 1,
       explanation: 'Ты дурак? Конечно, Маша'
   });
});

bot.command('weather', async (ctx, next) => {
    try {
        const coords = await axios({
            url: 'http://api.openweathermap.org/geo/1.0/direct',
            method: 'get',
            params: {
                appid: process.env.WHEATHER_KEY,
                q: 'Vladimir',
                limit: 1
            }
        });
        console.log(coords.data);
        const weather = await axios({
            url: 'https://api.openweathermap.org/data/2.5/onecall',
            method: 'get',
            params: {
                appid: process.env.WHEATHER_KEY,
                lat: 56.113215,
                lon: 40.352260,
                lang: 'ru',
                units: 'metric'
            }
        });
        ctx.reply('Получил');
        // console.log(weather.data.daily);
    } catch (e) {
        ctx.reply('Хер там, а не погода!');
    }
});

bot.launch()
    .then(() => {
        bot.telegram.setMyCommands([
            {command: 'start', description: 'Начать разговор'},
            {command: 'dices', description: 'Бросить кубик'},
            {command: 'html', description: 'HTML ответ'},
            {command: 'chart', description: 'Диаграмма'},
            {command: 'poll', description: 'Голосовалка'},
            {command: 'quiz', description: 'Опрос'},
            {command: 'weather', description: 'Погода'},
        ]);
        console.info('Bot was started');
    })
    .catch( error => console.error('Error starting bot', error));
