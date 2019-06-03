const invTypes = require('./inv-types.js');
const { makeCaptcha } = require('./captcha.js');

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

}

class HashmapInventory extends ArrayInventory {

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
    const captchaCard = makeCaptcha(_card);
    this.inv.putCard(captchaCard);
  }

  takeCard(_card) {
    return this.inv.takeCard(_card);
  }

  clearInventory() {
    this.inv = new enumToType[this.modus]();
  }

  changeModus(_newModus) {
    this.modus = _newModus;
    this.clearInventory();
  }
}

module.exports = User;
