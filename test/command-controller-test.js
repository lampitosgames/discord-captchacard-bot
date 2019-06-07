require('chai').should();
const invTypes = require("../bot/inv-types.js");
const { getUser, clearAllUsers, loadAllUsers } = require('../bot/user.js');
const { commandController, helpMessage } = require('../bot/command-controller.js');

describe('User command controller', () => {
  beforeEach((done) => {
    clearAllUsers();
    done();
  });

  it("should return false when the command is not recognized", () => {
    commandController("test-user", "noodle()").should.be.false;
    commandController("test-user", "captchalog(test)a").should.be.false;
    commandController("test-user", "ncaptchalog(test)").should.be.false;
    commandController("test-user", "modus(fakemodus)").should.be.false;
    commandController("test-user", null).should.be.false;
    commandController("test-user", undefined).should.be.false;
    commandController("test-user", "").should.be.false;
  });

  describe("Captcha Log Controller", () => {
    it("should add a card to a user's inventory when captchalog is called", () => {
      commandController("test-user", "captchalog(big yoshi-aaabbbcccd)");
      getUser("test-user").cards.should.include.all.members(["big yoshi-aaabbbcccd"]);
    });

    it("should return a user message including the name of the card with an added captcha", () => {
      commandController("test-user", "captchalog(big yoshi)").should.match(/^(added\s")(big\syoshi-)(.{10})("\sto\syour\sinventory)$/);
    });
  });

  describe("Use Controller", () => {
    it("should remove a card when the user uses it", () => {
      getUser("test-user").putCard("big yoshi-aaabbbcccd");
      commandController("test-user", "use(big yoshi-aaabbbcccd)");
      getUser("test-user").cards.should.not.include("big yoshi-aaabbbcccd");
    })
    it("should return a user message including the name of the used card", () => {
      getUser("test-user").putCard("big yoshi-aaabbbcccd");
      commandController("test-user", "use(big yoshi-aaabbbcccd)").should.match(/^(you\sused\s")(big\syoshi-)(.{10})(")$/);
    });
    it("should return false if user tries to use a card they don't have", () => {
      commandController("test-user", "use(asdf-aaabbbcccd)").should.be.false;
    });
  });

  describe("Modus Controller", () => {
    it("should change and clear inventory when valid type is invoked", () => {
      getUser("test-user").putCard("big yoshi-aaabbbcccd");
      commandController("test-user", "modus(hashmap)");
      getUser("test-user").modus.should.equal(invTypes.HASHMAP);
      getUser("test-user").cards.length.should.equal(0);
      commandController("test-user", "modus(queue)");
      getUser("test-user").modus.should.equal(invTypes.QUEUE);
      commandController("test-user", "modus(stack)");
      getUser("test-user").modus.should.equal(invTypes.STACK);
      commandController("test-user", "modus(array)");
      getUser("test-user").modus.should.equal(invTypes.ARRAY);
      commandController("test-user", "modus(tree)");
      getUser("test-user").modus.should.equal(invTypes.TREE);
    });

    it("should be case insensitive", () => {
      commandController("test-user", "modus(haSHmap)");
      getUser("test-user").modus.should.equal(invTypes.HASHMAP);
    });

    it("should return a message when inventory type is changed", () => {
      commandController("test-user", "modus(tree)").should.match(/^(changed\sinventory\stype\sto\stree)$/);
    });
  });

  describe("Help Controller", () => {
    it("should return the help message", () => {
      commandController("test-user", "help").should.equal(helpMessage);
    });
  })
});