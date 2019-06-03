require('chai').should();
const {
  getUser,
  clearAllUsers,
} = require('../bot/user-inventory.js');
const invTypes = require('../bot/inv-types.js');

const populateInventory = (_user) => {
  _user.putCard('card-one');
  _user.putCard('card-two');
  _user.putCard('card-three');
  _user.putCard('card-four');
  _user.putCard('card-five');
};

describe('User state management', () => {
  let user = null;

  beforeEach(() => {
    clearAllUsers();
    user = getUser('test-user');
  });

  it('should create a user if none exists when inventory is fetched', () => {
    user = getUser('new-user');
    user.should.not.equal(null);
  });

  it('should set ARRAY as the default data type for a user', () => {
    user.modus.should.equal(invTypes.ARRAY);
  });

  it('should properly add a card to a user\'s inventory', () => {
    user.putCard('cool kids');
    user.cards.should.contain('cool kids');
  });

  it('should properly remove a card from a user\'s inventory', () => {
    populateInventory(user);
    user.takeCard('card-two');
    user.cards.should.include.all.members([
      'card-one',
      'card-three',
      'card-four',
      'card-five',
    ]);
    user.cards.should.not.include('card-two');
  });

  it('should return removed cards', () => {
    populateInventory(user);
    const userCard = user.takeCard('card-two');
    userCard.should.equal('card-two');
    user.inv.count.should.equal(4);
  });

  it('should return false when removing a card that does not exist', () => {
    const userCard = user.takeCard('asdf');
    userCard.should.equal(false);
  });

  it('should have persistent user state and inventory', () => {
    user = getUser('user-one');
    user.putCard('card-one');
    user = getUser('user-two');
    user.putCard('card-two');
    getUser('user-one').cards.should.contain('card-one');
    getUser('user-two').cards.should.contain('card-two');
  });

  it('should properly clear and reset the inventory', () => {
    populateInventory(user);
    user.cards.should.contain('card-one');
    user.clearInventory();
    user.inv.count.should.equal(0);
  });

  it('should properly change the inventory type', () => {
    populateInventory(user);
    user.changeModus(invTypes.QUEUE);
    user.inv.count.should.equal(0);
    user.modus.should.equal(invTypes.QUEUE);
  });

  it('should obey queue rules when in queue mode', () => {
    user.changeModus(invTypes.QUEUE);
    populateInventory(user);
    const failedCardGet = user.takeCard('card-three');
    failedCardGet.should.equal(false);
    const firstInQueue = user.takeCard('card-one');
    firstInQueue.should.equal('card-one');
    const secondInQueue = user.takeCard('card-two');
    secondInQueue.should.equal('card-two');
    const lastInQueue = user.takeCard('card-five');
    lastInQueue.should.equal('card-five');
    const thirdInQueue = user.takeCard('card-three');
    thirdInQueue.should.equal('card-three');
    user.inv.count.should.equal(1);
  });

  it('should obey stack rules when in stack mode', () => {
    user.changeModus(invTypes.STACK);
    populateInventory(user);
    const failedCardGet = user.takeCard('card-three');
    failedCardGet.should.equal(false);
    const firstOut = user.takeCard('card-five');
    firstOut.should.equal('card-five');
    const secondOut = user.takeCard('card-four');
    secondOut.should.equal('card-four');
    const thirdOut = user.takeCard('card-three');
    thirdOut.should.equal('card-three');
    user.inv.count.should.equal(2);
  });
});
