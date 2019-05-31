require('chai').should();
const { getUser, addCard } = require('../bot/user-inventory.js');
const invTypes = require('../bot/inv-types.js');

describe('User state management', () => {
  let user = null;

  it('should create a user if none exists when inventory is fetched', () => {
    user = getUser('test-user');
    user.should.not.equal(null);
  });
  it('should set ARRAY as the default data type for a user', () => {
    user.modus.should.equal(invTypes.ARRAY);
  });
  it('should properly add a card to a user\'s inventory', () => {
    user = addCard(user.id, 'cool kids');
    user.inv.length.should.equal(1);
    user.inv[0].should.equal('cool kids');
  });
});
