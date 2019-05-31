require('chai').should();
const { getUserInventory } = require('../bot/user-inventory.js');
const invTypes = require('../bot/inv-types.js');

describe('User state management', () => {
  let user = null;

  it('should create a user if none exists when inventory is fetched', () => {
    user = getUserInventory('test-user');
    user.should.not.equal(null);
  });
  it('should set ARRAY as the default data type for a user', () => {
    user.modus.should.equal(invTypes.ARRAY);
  });

});