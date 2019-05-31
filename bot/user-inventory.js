const invTypes = require('./inv-types.js');

const userMap = {};

const getUser = (_userID) => {
  if (!(_userID in Object.keys(userMap))) {
    userMap[_userID] = {
      id: _userID,
      modus: invTypes.ARRAY,
      inv: [],
    };
  }
  return userMap[_userID];
};

const addCard = (_userID, _card) => {
  if (!(_userID in Object.keys(userMap))) {
    getUser(_userID);
  }
  userMap[_userID].inv.push(_card);
  return userMap[_userID];
};

module.exports = { getUser, addCard };
