require('chai').should();
const {
  getUser,
  clearAllUsers,
} = require('../bot/user-inventory.js');
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

    it('should set ARRAY as the default data type for a user', () => {
      user = getUser('new-user');
      user.modus.should.equal(invTypes.ARRAY);
    });
  });

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
    })
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
      user.cards[hashedIndex.toString()].should.equal("test card-aaabbbcccd");
    });

    it('should access stored cards via hash rather than via title', () => {
      let hashedIndex = (testCardHashVal % user.inv.cardsInDeck).toString();
      user.takeCard(hashedIndex).should.equal("test card-aaabbbcccd");
    });

    it('should replace the existing card if a new one has the same hash', () => {
      let hashedIndex = (testCardHashVal % user.inv.cardsInDeck).toString();
      user.cards[hashedIndex].should.equal('test card-aaabbbcccd');
      user.putCard('tent-card-aaabbbcccd');
      user.takeCard(hashedIndex).should.equal('tent-card-aaabbbcccd');
    });

    it('should return false if user asks for invalid index or a card name', () => {
      user.takeCard('8').should.be.false;
      user.takeCard('asdfasdf').should.be.false;
    });
  });

  describe('tree mode inventory', () => {

  })
});
//"pretest": "eslint ./bot/*.js ./test/*.js --fix",