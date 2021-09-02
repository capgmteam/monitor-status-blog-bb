const axios = require('axios');
const express = require('express');
const https = require('https');

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

const botSendMessage = (chatId, message) => {
  bot.telegram.sendMessage(chatId, message);
};

const getBlogMessage = (status) => ({
  error: `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. O blog retornou o status: ${status} !! 😨 ⚠️⚠️⚠️ 🚨🚨🚨`,
  success: `O status do blog no momento é: ${status} - Tudo certo! 😁`,
});

const getBlogApiMessage = (status) => ({
  error: `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. A API do BLOG retornou o status: ${status} !! 😨 ⚠️⚠️⚠️ 🚨🚨🚨`,
  success: `O status da API do blog no momento é: ${status} - Tudo certo! 😁`,
});

bot.command('blog', async (ctx) => {
  try {
    const currentStatus = await getCurrentBlogStatus();
    if (currentStatus !== 200) {
      botSendMessage(ctx.chat.id, getBlogMessage(currentStatus).error);
    } else {
      botSendMessage(ctx.chat.id, getBlogMessage(currentStatus).success);
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      botSendMessage(ctx.chat.id, getBlogMessage(error.response.data.statusCode).error);
    } else {
      console.log('erro ao verificar status do blog', error);
    }
  }
});

bot.command('api', async (ctx) => {
  try {
    const currentStatus = await getCurrentBlogApiStatus();
    if (currentStatus !== 200 && currentStatus !== 401) {
      botSendMessage(ctx.chat.id, getBlogApiMessage(currentStatus).error);
    } else {
      botSendMessage(ctx.chat.id, getBlogApiMessage(currentStatus).success);
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      if (error.response.data.statusCode !== 401) {
        botSendMessage(
          ctx.chat.id,
          getBlogApiMessage(error.response.data.statusCode).error
        );
      } else {
        botSendMessage(
          ctx.chat.id,
          getBlogApiMessage(error.response.data.statusCode).success
        );
      }
    } else {
      console.log('erro ao verificar status do blog', error);
    }
  }
});

bot.launch();

async function getCurrentBlogStatus() {
  return axios.get('https://blog.bb.com.br').then((r) => r.status);
}

async function getCurrentBlogApiStatus() {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  return axios
    .get('https://blog.api.bb.com.br', { httpsAgent: agent })
    .then((r) => r.status);
}

async function checkForCurrentStatus() {
  // BLOG
  try {
    const currentBlogStatus = await getCurrentBlogStatus();
    console.log('current blog status', currentBlogStatus);
    if (currentBlogStatus !== 200) {
      botSendMessage('-482183948', getBlogMessage(currentBlogStatus).error);
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      botSendMessage('-482183948', getBlogMessage(error.response.data.statusCode).error);
    } else {
      console.log('erro ao verificar status do blog', error);
    }
  }

  // BLOG API
  try {
    const currentBlogApiStatus = await getCurrentBlogApiStatus();
    console.log('current blog API status', currentBlogApiStatus);
    if (currentBlogApiStatus !== 200 && currentBlogApiStatus !== 401) {
      botSendMessage('-482183948', getBlogApiMessage(currentBlogApiStatus).error);
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      console.log('current blog API status', error.response.data.statusCode);
      if (error.response.data.statusCode !== 401) {
        botSendMessage(
          '-482183948',
          getBlogApiMessage(error.response.data.statusCode).error
        );
      }
    } else {
      console.log('erro ao verificar status do blog', error);
    }
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
