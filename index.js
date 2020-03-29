const Telegraf = require('telegraf');
const converter = require('xml-js');
const fs = require('fs');
const winston = require('winston');
const uuidv4 = require('uuid').v4;
require('dotenv').config();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'phrase-constructor' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.simple()
            )
        })
    ]
});

const bot = new Telegraf(process.env.BOT_TOKEN);
const mappingFile = fs.readFileSync('./mapping.xml');
const json = converter.xml2json(mappingFile.toString(), {compact: false});
const data = JSON.parse(json);

function generateMessage() {
    let message = '';

    data.elements[0].elements.forEach(element => {
        const items = element.elements.map(e => e.elements[0].text);

        const item = items[Math.floor(Math.random() * items.length)];

        message += ' ' + item;
    });

    return message.trim();
}

bot.command('covidify', async (ctx) => {
    const message = generateMessage();

    logger.info('Response to command triggered', {
        from: ctx.from,
        response: message
    });

    await ctx.reply(message);
});

bot.on('inline_query', async (ctx) => {
    const message = generateMessage();

    logger.info('Response to inline command triggered', {
        from: ctx.from,
        response: message
    });

    await ctx.answerInlineQuery([{
        id: uuidv4(),
        type: 'article',
        title: 'Ковіднутись',
        input_message_content: {
            parse_mode: 'HTML',
            message_text: message
        }
    }], {
        cache_time: 0,
        is_personal: true,
    });
});

bot.catch((err, ctx) => {
    logger.error(`Ooops, encountered an error for ${ctx.updateType}`, {
        error: err
    })
});

bot.launch();
