const should = require('chai').should();
const expect = require('chai').expect;
const {
  getUser,
  clearAllUsers,
  getUserMap
} = require('../bot/user.js');
const invTypes = require('../bot/inv-types.js');

const populateInventory = (_user) => {
  _user.putCard('card-one-aaabbbcccd');
  _user.putCard('card-two-aaabbbcccd');
  _user.putCard('card-three-aaabbbcccd');
  _user.putCard('card-four-aaabbbcccd');
  _user.putCard('card-five-aaabbbcccd');
};

describe('User state management', () => {
  let user = null;

  beforeEach((done) => {
    clearAllUsers();
    user = getUser('test-user');
    done();
  });

  describe('getUser', () => {
    it('should create a user if none exists when user is fetched', () => {
      user = getUser('new-user');
      user.should.not.equal(null);
    });

    it('should not create a new user if the same user is fetched twice', () => {
      user = getUser('new-user');
      user.putCard("test-card-time-aaabbbcccd");
      user = getUser('new-user');
      user.cards.should.include.all.members(["test-card-time-aaabbbcccd"]);
    });

    it('should set ARRAY as the default data type for a user', () => {
      user = getUser('new-user');
      user.modus.should.equal(invTypes.ARRAY);
    });
  });

  describe("clearAllUsers", () => {
    it('should reset the user map so that getUserMap returns an empty object', () => {
      user = getUser('new-user-1');
      getUserMap()['new-user-1'].should.not.be.null;
      clearAllUsers();
      expect(getUserMap()['new-user-1']).to.be.undefined;
    })
  })

  describe('adding and removing cards', () => {
    it('should properly add a card to a user\'s inventory', () => {
      user.putCard('cool kids-aaabbbcccd');
      user.cards.should.contain('cool kids-aaabbbcccd');
    });

    it('should properly remove a card from a user\'s inventory', () => {
      populateInventory(user);
      user.takeCard('card-two-aaabbbcccd');
      user.cards.should.include.all.members([
        'card-one-aaabbbcccd',
        'card-three-aaabbbcccd',
        'card-four-aaabbbcccd',
        'card-five-aaabbbcccd',
      ]);
      user.cards.should.not.include('card-two-aaabbbcccd');
    });

    it('should return removed cards', () => {
      populateInventory(user);
      const userCard = user.takeCard('card-two-aaabbbcccd');
      userCard.should.equal('card-two-aaabbbcccd');
      user.inv.count.should.equal(4);
    });

    it('should return false when removing a card that does not exist', () => {
      const userCard = user.takeCard('asdf');
      userCard.should.equal(false);
    });

    it('should properly clear and reset the inventory', () => {
      populateInventory(user);
      user.cards.should.contain('card-one-aaabbbcccd');
      user.clearInventory();
      user.inv.count.should.equal(0);
    });

    it('should properly handle weird inputs in the putCard method', () => {
      user.putCard(null);
      user.putCard(undefined);
      user.putCard("");
      user.inv.count.should.equal(0);
    });

    it('should properly handle weird inputs in the takeCard method', () => {
      populateInventory(user);
      user.takeCard(null);
      user.takeCard(undefined);
      user.takeCard(1);
      user.takeCard("");
      user.inv.count.should.equal(5);
    });

    it('should do nothing if a card with the same title already exists in inventory', () => {
      populateInventory(user);
      user.putCard("card-one").should.be.false;
    });
  });

  it('should have persistent user state and inventory', () => {
    user = getUser('user-one');
    user.putCard('card-one-aaabbbcccd');
    user = getUser('user-two');
    user.putCard('card-two-aaabbbcccd');
    getUser('user-one').cards.should.contain('card-one-aaabbbcccd');
    getUser('user-two').cards.should.contain('card-two-aaabbbcccd');
  });

  it('should properly change the inventory type', () => {
    populateInventory(user);
    user.changeModus("queue");
    user.inv.count.should.equal(0);
    user.modus.should.equal(invTypes.QUEUE);
  });

  describe('queue mode inventory', () => {
    it('should obey queue rules when in queue mode', () => {
      user.changeModus("queue");
      populateInventory(user);
      const failedCardGet = user.takeCard('card-three-aaabbbcccd');
      failedCardGet.should.equal(false);
      const firstInQueue = user.takeCard('card-one-aaabbbcccd');
      firstInQueue.should.equal('card-one-aaabbbcccd');
      const secondInQueue = user.takeCard('card-two-aaabbbcccd');
      secondInQueue.should.equal('card-two-aaabbbcccd');
      const lastInQueue = user.takeCard('card-five-aaabbbcccd');
      lastInQueue.should.equal('card-five-aaabbbcccd');
      const thirdInQueue = user.takeCard('card-three-aaabbbcccd');
      thirdInQueue.should.equal('card-three-aaabbbcccd');
      user.inv.count.should.equal(1);
    });
  });

  describe('stack mode inventory', () => {
    it('should obey stack rules when in stack mode', () => {
      user.changeModus("stack");
      populateInventory(user);
      const failedCardGet = user.takeCard('card-three-aaabbbcccd');
      failedCardGet.should.equal(false);
      const firstOut = user.takeCard('card-five-aaabbbcccd');
      firstOut.should.equal('card-five-aaabbbcccd');
      const secondOut = user.takeCard('card-four-aaabbbcccd');
      secondOut.should.equal('card-four-aaabbbcccd');
      const thirdOut = user.takeCard('card-three-aaabbbcccd');
      thirdOut.should.equal('card-three-aaabbbcccd');
      user.inv.count.should.equal(2);
    });
  });

  describe('hashmap mode inventory', () => {
    let testCardHashVal = 16;

    beforeEach((done) => {
      user.changeModus("hashmap");
      user.putCard("test card-aaabbbcccd");
      done();
    });

    it('should properly hash cards and store them in the inventory', () => {
      let hashedIndex = testCardHashVal % user.inv.cardsInDeck;
      user.cards.should.include.all.members(["test card-aaabbbcccd"]);
    });

    it('should access stored cards via hash rather than via title', () => {
      let hashedIndex = (testCardHashVal % user.inv.cardsInDeck).toString();
      user.takeCard(hashedIndex).should.equal("test card-aaabbbcccd");
    });

    it('should replace the existing card if a new one has the same hash', () => {
      let hashedIndex = (testCardHashVal % user.inv.cardsInDeck).toString();
      user.inv.data[hashedIndex].should.equal('test card-aaabbbcccd');
      user.putCard('tent-card-aaabbbcccd');
      user.takeCard(hashedIndex).should.equal('tent-card-aaabbbcccd');
    });

    it('should return false if user asks for invalid index or a card name', () => {
      user.takeCard('8').should.be.false;
      user.takeCard('asdfasdf').should.be.false;
      user.takeCard('').should.be.false;
    });
  });

  describe('tree mode inventory', () => {
    beforeEach((done) => {
      user.changeModus("tree");
      done();
    });

    it('should construct a tree with nodes that cannot be removed', () => {
      user.putCard('card-1-aaabbbcccd');
      user.putCard('card-2-aaabbbcccd');
      user.takeCard('card-1-aaabbbcccd').should.be.false;
    });

    it('should be able to remove nodes with no children', () => {
      user.putCard('card-1-aaabbbcccd');
      user.putCard('card-2-aaabbbcccd');
      user.putCard('card-3-aaabbbcccd');
      user.takeCard('card-2-aaabbbcccd').should.equal('card-2-aaabbbcccd');
      user.takeCard('card-3-aaabbbcccd').should.equal('card-3-aaabbbcccd');
      user.takeCard('card-1-aaabbbcccd').should.equal('card-1-aaabbbcccd');
    });

    describe('larger tree testing', () => {
      beforeEach((done) => {
        for (let j = 0; j < 12; j++) {
          user.putCard(`card-${j}-aaabbbcccd`);
        }
        done();
      });

      it('should not be able to remove a deep node with children', () => {
        user.takeCard('card-4-aaabbbcccd').should.be.false;
        user.takeCard('card-5-aaabbbcccd').should.be.false;
        user.takeCard('card-11-aaabbbcccd');
        user.takeCard('card-10-aaabbbcccd');
        user.takeCard('card-9-aaabbbcccd');
        user.takeCard('card-5-aaabbbcccd').should.equal('card-5-aaabbbcccd');
      });

      it('should insert new cards into the first valid slot', () => {
        user.takeCard('card-6-aaabbbcccd');
        user.takeCard('card-7-aaabbbcccd');
        user.takeCard('card-8-aaabbbcccd');
        user.takeCard('card-3-aaabbbcccd');
        user.putCard('newly-inserted-card-aaabbbcccd');
        user.putCard('newly-inserted-card-2-aaabbbcccd');
        user.putCard('newly-inserted-card-3-aaabbbcccd');
        user.putCard('newly-inserted-card-4-aaabbbcccd');
        user.putCard('newly-inserted-card-5-aaabbbcccd');
        user.cards[3].should.equal('newly-inserted-card-aaabbbcccd');
        user.cards[6].should.equal('newly-inserted-card-2-aaabbbcccd');
        user.cards[7].should.equal('newly-inserted-card-3-aaabbbcccd');
        user.cards[8].should.equal('newly-inserted-card-4-aaabbbcccd');
        user.cards[12].should.equal('newly-inserted-card-5-aaabbbcccd');
      });
    });
  });
});
//"pretest": "eslint ./bot/*.js ./test/*.js --fix",