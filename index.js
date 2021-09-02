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

const getBlogErrorMessage = (status) =>
  `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. O blog retornou o status: ${status} !! 😨 ⚠️⚠️⚠️ 🚨🚨🚨`;
const getBlogSuccessMessage = (status) =>
  `O status do blog no momento é: ${status} - Tudo certo! 😁`;

const getBlogApiErrorMessage = (status) =>
  `⚠️⚠️⚠️ 🚨🚨🚨 Oops! Algo não está certo. A API do BLOG retornou o status: ${status} !! 😨 ⚠️⚠️⚠️ 🚨🚨🚨`;
const getBlogApiSuccessMessage = (status) =>
  `O status da API do blog no momento é: ${status} - Tudo certo! 😁`;

bot.command('blog', async (ctx) => {
  try {
    const currentStatus = await getCurrentBlogStatus();
    if (currentStatus !== 200) {
      botSendMessage(ctx.chat.id, getBlogErrorMessage(currentStatus));
    } else {
      botSendMessage(ctx.chat.id, getBlogSuccessMessage(currentStatus));
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      botSendMessage(ctx.chat.id, getBlogErrorMessage(error.response.data.statusCode));
    } else {
      console.log('erro ao verificar status do blog', error);
    }
  }
});

bot.command('api', async (ctx) => {
  try {
    const currentStatus = await getCurrentBlogApiStatus();
    if (currentStatus !== 200 && currentStatus !== 401) {
      botSendMessage(ctx.chat.id, getBlogApiErrorMessage(currentStatus));
    } else {
      botSendMessage(ctx.chat.id, getBlogApiSuccessMessage(currentStatus));
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
          getBlogApiErrorMessage(error.response.data.statusCode)
        );
      } else {
        botSendMessage(
          ctx.chat.id,
          getBlogApiSuccessMessage(error.response.data.statusCode)
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
      botSendMessage('-482183948', getBlogErrorMessage(currentBlogStatus));
    }
  } catch (error) {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.statusCode
    ) {
      botSendMessage('-482183948', getBlogErrorMessage(error.response.data.statusCode));
    } else {
      console.log('erro ao verificar status do blog', error);
    }
  }

  // BLOG API
  try {
    const currentBlogApiStatus = await getCurrentBlogApiStatus();
    console.log('current blog API status', currentBlogApiStatus);
    if (currentBlogApiStatus !== 200 && currentBlogApiStatus !== 401) {
      botSendMessage('-482183948', getBlogApiErrorMessage(currentBlogApiStatus));
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
          getBlogApiErrorMessage(error.response.data.statusCode)
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
