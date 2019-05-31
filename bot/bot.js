const Discord = require('discord.io');
const auth = require('../auth.json');

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true,
});

bot.on('ready', () => {
  console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', (user, userID, channelID, message) => {
  if (message[0] === '!') {
    const commandString = message.substr(1);
    if (commandString === 'ping') {
      bot.sendMessage({
        to: channelID,
        message: 'pong',
      });
    }
  }
});
