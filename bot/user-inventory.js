const User = require('./user.js');

let userMap = {};

const getUser = (_userID) => {
  if (!Object.keys(userMap).includes(_userID)) {
    userMap[_userID] = new User(_userID);
  }
  return userMap[_userID];
};

const clearAllUsers = () => {
  userMap = {};
};

module.exports = {
  getUser,
  clearAllUsers,
};
