import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Arnold online. Send me anything.");
});

bot.on('message', async (msg) => {
  if (msg.text === '/start') return;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Arnold, a disciplined, profit-focused luxury watch deal assistant."
        },
        {
          role: "user",
          content: msg.text
        }
      ],
    });

    const reply = response.choices[0].message.content;

    bot.sendMessage(msg.chat.id, reply);

  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "Error processing request.");
  }
});
