const axios = require('axios');
const express = require('express');

const packageJson = require('./package.json');

const { Telegraf } = require('telegraf');

require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);

bot.command('start', (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    'Bem vindo ao bot que está sempre ao seu dispor!',
    {}
  );
});

bot.command('blog', async (ctx) => {
  try {
    const currentStatus = await getCurrentBlogStatus();
    if (currentStatus === 200) {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `O status do blog no momento é: ${currentStatus} - Tudo certo! 😁`
      );
    } else {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. O blog retornou o status: ${currentStatus} !! 😨`
      );
    }
  } catch (error) {
    console.log('erro ao verificar status do blog', error);
  }
});

bot.launch();

async function getCurrentBlogStatus() {
  return axios.get('https://blog.bb.com.br').then((r) => r.status);
}

async function checkForCurrentStatus() {
  try {
    const currentStatus = await getCurrentBlogStatus();
    console.log('current status', currentStatus);
    if (currentStatus !== 200) {
      bot.telegram.sendMessage(
        '-482183948',
        `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. O blog retornou o status: ${currentStatus} !! 😨 ⚠️⚠️⚠️ 🚨🚨🚨`
      );
    }
    // else {
    //   bot.telegram.sendMessage(
    //     '-482183948',
    //     `O status do blog no momento é: ${currentStatus} - Tudo certo! 😁`
    //   );
    // }
  } catch (error) {
    console.log('erro ao verificar status do blog', error);
  }
}

const app = express();

app.get('/', (req, res) => {
  res.send({ appVersion: packageJson.version });
});

app.post('/check-blog-status', (req, res) => {
  checkForCurrentStatus();
  res.status(200).send({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening at ${process.env.PORT}`);
});
