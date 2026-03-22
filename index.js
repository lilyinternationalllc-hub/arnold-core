import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import http from 'http';

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;
const port = process.env.PORT || 3000;
const webhookPath = '/telegram-webhook';
const webhookUrl = appUrl ? `${appUrl}${webhookPath}` : null;

const bot = new TelegramBot(token);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Arnold online. Send me anything.');
});

bot.on('message', async (msg) => {
  if (msg.text === '/start') return;
  if (!msg.text) return;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are Arnold, a disciplined, profit-focused luxury watch deal assistant."
        },
        {
          role: "user",
          content: msg.text,
        },
      ],
    });

    const reply =
      response?.choices?.[0]?.message?.content || "No response generated.";

    await bot.sendMessage(msg.chat.id, reply);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(msg.chat.id, 'Error processing request.');
  }
});

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === webhookPath) {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        await bot.processUpdate(update);
        res.writeHead(200);
        res.end('ok');
      } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end('error');
      }
    });

    return;
  }

  res.writeHead(200);
  res.end('Arnold is running');
});

server.listen(port, async () => {
  console.log(`Server listening on ${port}`);

  if (webhookUrl) {
    await bot.deleteWebHook();
    await bot.setWebHook(webhookUrl);
    console.log(`Webhook set to ${webhookUrl}`);
  }
});
