const fs = require('fs');
const path = require('path');

const captchaReg = /-[^\s]{10}$/;

let characterList = '';

const ensureLoadedCharacters = () => {
  if (characterList.length > 0) return;
  fs.readFile(path.join(__dirname, './characters.txt'), 'utf8', (err, contents) => {
    contents.normalize().split('\n').forEach((line) => {
      line.split(' ').forEach((char) => {
        char.split('').forEach(c => characterList += c);
      });
    });
  });
};

const hasCaptcha = (_card) => {
  // Does this card already have a captcha?
  if (captchaReg.test(_card)) {
    return true;
  } else {
    return false;
  }
};

const getNewCaptcha = () => {
  let captchaString = "";
  for (let i = 0; i < 10; i++) {
    let charIndex = Math.floor(Math.random() * characterList.length);
    captchaString += characterList.charAt(charIndex);
  }
  return captchaString;
};

const makeCaptcha = (_card) => {
  ensureLoadedCharacters();
  if (hasCaptcha(_card)) {
    return _card;
  }
  let cardWithCaptcha = _card + "-" + getNewCaptcha();
  return cardWithCaptcha;
};

const title = (_card) => {
  return _card.replace(captchaReg, "");
}

const captcha = (_card) => {
  let matchedCaptcha = _card.match(captchaReg);
  if (matchedCaptcha === null) { return ""; }
  return matchedCaptcha[0].substr(1);
}

module.exports = {
  ensureLoadedCharacters,
  hasCaptcha,
  getNewCaptcha,
  makeCaptcha,
  title,
  captcha
};