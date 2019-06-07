const fs = require('fs');
const path = require('path');

const captchaReg = /-[^\s]{10}$/;

let characterList = '';

const ensureLoadedCharacters = () => {
  if (characterList.length > 0) return new Promise((resolve, reject) => resolve());
  let contents = fs.readFileSync(path.join(__dirname, './characters.txt'), 'utf8');
  contents.normalize().split('\n').forEach((line) => {
    line.split(' ').forEach((char) => {
      char.split('').forEach((c) => {
        characterList += c;
      });
    });
  });
};

const hasCaptcha = (_card) => {
  // Does this card already have a captcha?
  if (captchaReg.test(_card)) {
    return true;
  }
  return false;
};

const getNewCaptcha = () => {
  let captchaString = '';
  for (let i = 0; i < 10; i++) {
    const charIndex = Math.floor(Math.random() * characterList.length);
    captchaString += characterList.charAt(charIndex);
  }
  return captchaString;
};

const makeCaptcha = (_card) => {
  ensureLoadedCharacters();
  if (hasCaptcha(_card)) {
    return _card;
  }
  const cardWithCaptcha = _card + "-" + getNewCaptcha();
  return cardWithCaptcha;
};

const title = _card => _card.replace(captchaReg, '');

const captcha = (_card) => {
  const matchedCaptcha = _card.match(captchaReg);
  if (matchedCaptcha === null) { return ''; }
  return matchedCaptcha[0].substr(1);
};

module.exports = {
  ensureLoadedCharacters,
  hasCaptcha,
  getNewCaptcha,
  makeCaptcha,
  title,
  captcha,
};