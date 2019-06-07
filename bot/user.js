const invTypes = require('./inv-types.js');
const captcha = require('./captcha.js');

let userMap = {};

class ArrayInventory {
  constructor() {
    this.data = [];
  }

  get count() {
    return this.data.length;
  }

  putCard(_card) {
    this.data.push(_card);
  }

  takeCard(_card) {
    const [removedCard] = this.data.splice(this.data.indexOf(_card), 1);
    if (removedCard) {
      return removedCard;
    }
    return false;
  }
}

class QueueInventory extends ArrayInventory {
  putCard(_card) {
    this.data.unshift(_card);
  }

  takeCard(_card) {
    if (_card === this.data[this.data.length - 1]) {
      return this.data.pop();
    }
    if (_card === this.data[0]) {
      return this.data.shift();
    }
    return false;
  }
}

class StackInventory extends ArrayInventory {
  putCard(_card) {
    this.data.push(_card);
  }

  takeCard(_card) {
    if (_card === this.data[this.data.length - 1]) {
      return this.data.pop();
    }
    return false;
  }
}

class TreeInventory extends ArrayInventory {
  constructor() {
    super();
    this.nodeCount = 0;
  }

  get count() {
    return this.nodeCount;
  }

  nodeLeftChild(_i) {
    if (2 * _i + 1 < this.data.length) {
      return 2 * _i + 1;
    } else {
      return false;
    }
  }
  nodeRightChild(_i) {
    if (2 * _i + 2 < this.data.length) {
      return 2 * _i + 2;
    } else {
      return false;
    }
  }

  canBePulled(_ind) {
    let leftI = this.nodeLeftChild(_ind); //11
    let rightI = this.nodeRightChild(_ind); //false

    if (leftI !== false && this.data[leftI] !== 0) {
      return false;
    }
    if (rightI !== false && this.data[rightI] !== 0) {
      return false;
    }
    return true;
  }

  putCard(_card) {
    let nextEmptyLeaf = this.data.indexOf(0);
    if (nextEmptyLeaf === -1) {
      this.data.push(_card);
      return;
    }
    data[nextEmptyLeaf] = _card;
  }

  takeCard(_card) {
    if (!this.data.includes(_card)) return false;
    let ind = this.data.indexOf(_card);
    if (!this.canBePulled(ind)) return false;
    let pulledCard = this.data[ind];
    this.data[ind] = 0;
    this.nodeCount -= 1;
    return pulledCard;
  }
}

class HashmapInventory extends ArrayInventory {
  constructor() {
    super();
    this.cardsInDeck = 10;
    this.data = {};
  }

  get count() {
    return Object.keys(this.data).length;
  }

  hashCardTitle(_title) {
    const vowels = "aeiouAEIOU";
    let charValueTotal = 0;
    for (let i = 0; i < _title.length; i++) {
      if (vowels.includes(_title.substr(i, 1))) {
        charValueTotal += 1;
      } else {
        charValueTotal += 2;
      }
    }
    return charValueTotal % this.cardsInDeck;
  }

  putCard(_card) {
    const title = captcha.title(_card);
    const hash = this.hashCardTitle(title).toString();
    this.data[hash] = _card;
  }

  takeCard(_cardIndex) {
    if (Object.keys(this.data).includes(_cardIndex)) {
      return this.data[_cardIndex];
    }
    return false;
  }
}

const enumToType = {
  ARRAY: ArrayInventory,
  QUEUE: QueueInventory,
  STACK: StackInventory,
  TREE: TreeInventory,
  HASHMAP: HashmapInventory,
};

class User {
  constructor(_id) {
    this.id = _id;
    this.modus = invTypes.ARRAY;
    this.inv = new ArrayInventory();
  }

  get cards() {
    return this.inv.data;
  }

  putCard(_card) {
    if (typeof _card !== 'string') return false;
    if (_card === "") return false;
    const captchaCard = captcha.makeCaptcha(_card);
    this.inv.putCard(captchaCard);
    return true;
  }

  takeCard(_card) {
    if (typeof _card !== 'string') return false;
    if (_card === "") return false;
    return this.inv.takeCard(_card);
  }

  clearInventory() {
    this.inv = new enumToType[this.modus]();
    return true;
  }

  changeModus(_newModus) {
    switch (_newModus) {
    case "array":
      this.modus = invTypes.ARRAY;
      break;
    case "stack":
      this.modus = invTypes.STACK;
      break;
    case "queue":
      this.modus = invTypes.QUEUE;
      break;
    case "hashmap":
      this.modus = invTypes.HASHMAP;
      break;
    case "tree":
      this.modus = invTypes.TREE;
      break;
    default:
      return false;
      break;
    }
    this.clearInventory();
    return true;
  }
}

const getUser = (_userID) => {
  if (!Object.keys(userMap).includes(_userID)) {
    userMap[_userID] = new User(_userID);
  }
  return userMap[_userID];
};

const clearAllUsers = () => {
  userMap = {};
};

const getUserMap = () => {
  return userMap;
}

module.exports = { User, getUser, clearAllUsers, getUserMap };