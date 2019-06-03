const { makeCaptcha } = require('../bot/captcha.js');

describe('Captcha generation', () => {
  it('should not create a captcha for a card that already has one', () => {
    const postCaptcha = makeCaptcha('test card-aaabbbcccc');
    postCaptcha.should.equal('test card-aaabbbcccc');
  });
});
