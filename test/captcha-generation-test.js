require('chai').should();
const {
  ensureLoadedCharacters,
  hasCaptcha,
  getNewCaptcha,
  makeCaptcha,
  title,
  captcha
} = require('../bot/captcha.js');

describe('Captcha generation', () => {
  beforeEach(() => {
    ensureLoadedCharacters();
  });

  describe("hasCaptcha", () => {
    it('should return false when a card doesn\'t have a captcha', () => {
      hasCaptcha('test card without captcha').should.be.false;
    });
    it('should return true when a card does have a captcha', () => {
      hasCaptcha('test card with captcha-jnslfe28s0').should.be.true;
    });
    it('should not fail when passed arbitrary data', () => {
      hasCaptcha({ test: "" }).should.be.false;
    });
    it('should fail when the captcha has a space', () => {
      hasCaptcha("test card-aaa bbbccc").should.be.false;
    })
    it('should properly detect captcha when the card name has a - character', () => {
      hasCaptcha("Testing-the cool stuff-aaabbbcccd").should.be.true;
    })
  });

  describe('getNewCaptcha', () => {
    it('should generate a 10 character string', () => {
      getNewCaptcha().length.should.equal(10);
    });
  });

  describe('makeCaptcha', () => {
    it('should not create a captcha for a card that already has one', () => {
      const afterCaptcha = makeCaptcha('test card-aaabbbcccd');
      afterCaptcha.should.equal('test card-aaabbbcccd');
    });
    it('should create a captcha for a card that does not have one', () => {
      const captchaCard = makeCaptcha('test card');
      captchaCard.should.contain('test card');
      hasCaptcha(captchaCard).should.be.true;
    });
  });

  describe('title', () => {
    it('should return just the title when passed a captcha card', () => {
      title('test card-aaabbbcccd').should.equal('test card');
    });
    it('should do nothing to a card without a captcha', () => {
      title('test card-').should.equal('test card-');
    });
  });

  describe('captcha', () => {
    it('should return just the captcha when passed a captcha card', () => {
      captcha('test card-aaabbbcccd').should.equal('aaabbbcccd');
    });
    it('should return an empty string when passed a card with no captcha', () => {
      captcha('test card').should.be.empty;
    });
  });
});