const { getUser } = require('./user.js');


const captchalogReg = /^captchalog\((.*)\)$/i;
const captchalogController = (_user, _commandString) => {
  let [, card] = _commandString.split(/\(|\)/);
  let result = getUser(_user).putCard(card);
  if (!result) { return false; }
  getUser(_user).save();
  return `added "${result}" to your inventory`;
}

const useReg = /^use\((.*)\)$/i;
const useController = (_user, _commandString) => {
  let [, card] = _commandString.split(/\(|\)/);
  let result = getUser(_user).takeCard(card);
  if (!result) { return false; }
  getUser(_user).save();
  return `you used "${result}"`;
}

const modusReg = /^modus\((array|queue|stack|hashmap|tree)\)$/i;
const modusController = (_user, _commandString) => {
  let [, newModus] = _commandString.split(/\(|\)/);
  let result = getUser(_user).changeModus(newModus.toLowerCase());
  if (!result) { return false; }
  getUser(_user).save();
  return `changed inventory type to ${result}`;
}

const helpReg = /^help$/i;
const helpMessage = "Command List:\n!captchalog(item_name) - pick up an item and put it into inventory. If no captcha is provided, generate it\n!use(item_name) - pulls the item out of the inventory (but only if it is allowed by data struct)\n!modus(structure_id) - clears inventory and changes the data structure";
const helpController = () => {
  return helpMessage;
}

const commandController = (_user, _commandString) => {
  if (typeof _commandString === "string" && typeof _user === "string") {
    if (captchalogReg.test(_commandString)) {
      return captchalogController(_user, _commandString);
    } else if (useReg.test(_commandString)) {
      return useController(_user, _commandString);
    } else if (modusReg.test(_commandString)) {
      return modusController(_user, _commandString);
    } else if (helpReg.test(_commandString)) {
      return helpController();
    }
  }
  return false;
}

module.exports = {
  helpMessage,
  commandController
};