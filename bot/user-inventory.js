const invTypes = require('./inv-types.js');

const userMap = {};

const getUserInventory = (_userID) => {
  if (_userID in Object.keys(userMap)) {
    return userMap[_userID];
  }
  return {
    userID: _userID,
    modus: invTypes.ARRAY,
    inv: [],
  };
};

module.exports = { getUserInventory };
