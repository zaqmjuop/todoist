import missions from './indexeddb/missions';

const isElement = element => (element && (element.nodeType === 1));

const isString = str => (str && (typeof str === 'string'));

const getParent = (element) => {
  if (!isElement(element)) return false;
  return element.parentNode;
};

const getParents = (element) => {
  if (!isElement(element)) return false;
  const result = [];
  let parent = element;
  for (let index = 0; index < 999; index += 1) {
    parent = getParent(parent);
    if (!isElement(parent)) break;
    result.push(parent);
  }
  return result;
};

const Index = {
  i: 0,
  getIndex: () => {
    Index.i += 1;
    return Index.i;
  },
};

class Dom {
  constructor(query) {
    if (typeof query === 'string') {
      const eleReg = /^<(.+)>$/;
      const eleMatch = query.match(eleReg);
      if (eleMatch) {
        const tagName = eleMatch[1].toLocaleUpperCase();
        this.dom = document.createElement(tagName);
      } else {
        return document.querySelectorAll(query);
      }
    } else if (query instanceof Dom) {
      this.dom = query.dom;
    } else if (isElement(query)) {
      this.dom = query;
    } else {
      console.warn(query);
      throw new TypeError('无效参数');
    }
    return this;
  }

  static of(str) {
    return new Dom(str);
  }

  attr(key, value) {
    this.dom.setAttribute(key, value);
    return this;
  }

  addClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    const ary = content.split(' ');
    ary.forEach(value => this.dom.classList.add(value));
    return this;
  }

  removeClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    const ary = content.split(' ');
    ary.forEach(value => this.dom.classList.remove(value));
    return this;
  }

  append(object) {
    const element = (object instanceof Dom) ? object.dom : object;
    if (!element || (element.nodeType !== 1)) throw new TypeError('参数不是html元素');
    this.dom.appendChild(element);
    return this;
  }

  remove(object) {
    if (!object) {
      this.dom.remove();
    } else if (isElement(object)) {
      this.dom.removeChild(object);
    } else if (isString(object)) {
      const element = this.dom.querySelector(object);
      this.dom.removeChild(element);
    }
    return this;
  }

  text(content) {
    this.dom.innerText = content;
    return this;
  }

  html(content) {
    this.dom.innerHTML = content;
    return this;
  }

  find(query) {
    return this.dom.querySelector(query);
  }

  children(query) {
    return this.dom.querySelectorAll(query);
  }

  parent() {
    const parent = this.dom.parentNode;
    const result = (parent && (parent.nodeType === 1)) ? parent : undefined;
    return result;
  }

  parents(query) {
    const parents = getParents(this.dom);
    let result = [];
    if (query && isString(query)) {
      const all = document.querySelectorAll(query);
      all.forEach((parent) => {
        if (parents.includes(parent)) {
          result.push(parent);
        }
      });
    } else {
      result = parents;
    }
    return result;
  }

  on(event, callback) {
    this.dom.addEventListener(event, callback);
    return this;
  }

  off(event, callback) {
    this.dom.removeEventListener(event, callback);
    return this;
  }
}

const $ = Dom.of;
window.$ = $;

class Dialog {
  static createDialogElement() {
    const body = $('body')[0];
    if (!body.dom) throw new ReferenceError('页面主体没有加载完');
    const dialog = $('<div>').addClass('dialog');
    const curtain = $('<div>').addClass('curtain');
    const alert = $('<div>').addClass('alert');
    const msg = $('<div>').addClass('msg');
    const buttonGroup = $('<div>').addClass('alert-buttons');
    const submit = $('<button>').text('确定');
    submit.on('click', () => {
      body.remove(dialog);
    });
    buttonGroup.append(submit);
    alert.append(msg).append(buttonGroup);
    dialog.append(curtain).append(alert);
    return dialog.dom;
  }

  static alert(message) {
    if (!message || (typeof message !== 'string')) throw new TypeError('参数只能是字符串');
    const body = $('body')[0];
    if (!body.dom) throw new ReferenceError('页面主体没有加载完');
    const dialog = Dialog.createDialogElement();
    const msg = dialog.querySelector('.msg');
    if (!msg) throw new ReferenceError('dialog不完整');
    msg.innerText = message;
    return body.append(dialog);
  }
}

class Mission {
  constructor() {
    this.element = document.querySelector('#mission');
    this.listElement = document.querySelector('#mission-list');
    this.formElement = document.querySelector('#mission-form');
    this.adderElement = document.querySelector('#add-mission');
    if (!this.element || !this.listElement || !this.formElement || !this.adderElement) {
      throw new ReferenceError('界面元素不完整');
    }
    this.init();
    this.loadDB();
    return this;
  }

  loadDB() {
    missions.ready()
      .then(() => missions.getAll())
      .then((results) => {
        results.forEach((result) => {
          const missionItem = Mission.createMissionItem(result.content, result.date, result.id);
          $(this.listElement).append(missionItem);
        });
      });
    return this;
  }

  init() {
    if (this.init === 1) return false;
    const openForm = $(this.adderElement).find('*[name=open-form]');
    $(openForm).on('click', () => {
      $(this.formElement).removeClass('hide');
    });
    const submit = $(this.formElement).find('button[name=submit]');
    $(submit).on('click', () => {
      this.createMission();
    });
    const hideForm = $(this.formElement).find('*[name=hide-form]');
    $(hideForm).on('click', () => {
      $(this.formElement).addClass('hide');
    });
    const finishItemButtons = $(this.listElement).children('*[name=finish]');
    finishItemButtons.forEach((button) => {
      $(button).on('click', () => {
        const item = $(button).parents('.mission-item')[0];
        $(item).remove();
      });
    });
    this.init = 1;
    return this;
  }

  static isElementComplete() {
    const element = document.querySelector('#mission');
    const listElement = document.querySelector('#mission-list');
    const formElement = document.querySelector('#mission-form');
    const adderElement = document.querySelector('#add-mission');
    return element && listElement && formElement && adderElement;
  }

  static createMissionItem(leftText, rightText, id) {
    if (!Mission.isElementComplete()) throw new ReferenceError('界面元素不完整');
    const item = $('<li>').addClass('mission-item').attr('id', `item-${id}`);
    const left = $('<div>').addClass('item-left');
    const right = $('<div>').addClass('item-right');
    const icon = $('<i>').addClass('fa fa-circle-o item-icon fa-lg').attr('name', 'finish');
    const text = $('<span>').text(leftText);
    const date = $('<span>').addClass('text-sm-center').text(rightText);
    const link = $('<a>').append(icon);
    window.link = link;
    link.on('click', () => {
      missions.ready()
        .then(() => missions.delete(id))
        .then(() => item.remove());
    });
    left.append(link).append(text);
    right.append(date);
    item.append(left).append(right);
    return item.dom;
  }

  createMission() {
    const form = this.formElement;
    const contentInput = $(form).find('input[type=text]');
    if (!contentInput.value) return false;
    const dateInput = $(form).find('input[type=datetime-local]');
    const item = { content: contentInput.value, date: dateInput.value };
    missions.create(item).then((id) => {
      const missionItem = Mission.createMissionItem(contentInput.value, dateInput.value, id);
      contentInput.value = '';
      dateInput.value = '';
      $(this.listElement).append(missionItem);
    });
    return this;
  }

  static getElement() {
    return document.querySelector('#mission');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Dialog.alert('弹出框');
  const mission = new Mission();
  window.mission = mission;
  // mission.createMission()
});
