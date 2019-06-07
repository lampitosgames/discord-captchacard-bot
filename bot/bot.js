const Discord = require('discord.io');
const auth = require('../auth.json');
const { loadAllUsers } = require('./user.js');
const { commandController } = require('./command-controller.js');

//Load user data from disk
loadAllUsers();

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
    const commandResult = commandController(user, commandString);
    if (commandResult === false) { return; }
    bot.sendMessage({
      to: channelID,
      message: commandResult
    });
  }
  return;
});