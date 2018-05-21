import missions from './indexeddb/missions';

const isKeyEnter = event => ((event instanceof KeyboardEvent) && (event.keyCode === 13));

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
    if (!key || !isString(key)) throw new TypeError('没有key参数');
    let result = this;
    if (value !== undefined) {
      this.dom.setAttribute(key, `${value}`);
    } else {
      result = this.dom.getAttribute(key);
    }
    return result;
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
      const adderParent = $(this.adderElement).parent();
      adderParent.insertBefore(this.formElement, this.adderElement);
      $(this.formElement).find('input[name=content]').value = '';
      $(this.formElement).find('input[name=date]').value = '';
      $(this.formElement).attr('data-item-id', '').removeClass('hide');
    });
    const submit = $(this.formElement).find('button[name=submit]');
    $(submit).on('click', () => {
      const itemId = $(this.formElement).attr('data-item-id');
      if (!itemId) {
        this.createMission();
      } else {
        this.updateMission();
      }
    });
    const formInputs = $(this.formElement).children('input');
    formInputs.forEach((input) => {
      $(input).on('keypress', (event) => {
        if (isKeyEnter(event)) {
          submit.click();
        }
      });
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

  static transformItem(missionItem) {
    if (!isElement(missionItem) || !missionItem.classList.contains('mission-item')) throw new TypeError('不是任务列表的子元素');
    const parent = $(missionItem).parent();
    const nextItem = missionItem.nextSibling;
    const form = $('#mission-form')[0];
    const content = $(missionItem).find('*[name=content]').innerText;
    const date = $(missionItem).find('*[name=date]').innerText;
    const missionItems = parent.querySelectorAll('.mission-item');
    missionItems.forEach((item) => {
      if (item.id !== missionItem.id) {
        $(item).removeClass('hide');
      }
    });
    $(missionItem).addClass('hide');
    parent.insertBefore(form, nextItem);
    $(form).removeClass('hide').attr('data-item-id', missionItem.id);
    $(form).find('input[name=content]').value = content;
    $(form).find('input[name=date]').value = date;
    return form;
  }

  static createMissionItem(leftText, rightText, id) {
    if (!Mission.isElementComplete()) throw new ReferenceError('界面元素不完整');
    const item = $('<li>').addClass('mission-item').attr('id', `item-${id}`).attr('draggable', 'true');
    const before = $('<div>').addClass('item-before');
    const moveIcon = $('<i>').addClass('fa fa-arrows');
    const left = $('<div>').addClass('item-left');
    const right = $('<div>').addClass('item-right');
    const icon = $('<i>').addClass('fa fa-circle-o item-icon fa-lg').attr('name', 'finish');
    const text = $('<span>').attr('name', 'content').text(leftText);
    const date = $('<span>').attr('name', 'date').addClass('text-sm-center').text(rightText);
    const link = $('<a>').append(icon);
    window.link = link;
    text.on('click', () => {
      Mission.transformItem(item.dom);
    });
    link.on('click', () => {
      missions.ready()
        .then(() => missions.delete(id))
        .then(() => item.remove());
    });
    moveIcon.on('click', () => {
      console.log('这里要改成keydown draggable="true" keyup draggable="false"');
    });
    item.on('dragstart', (event) => {
      const parent = item.parent();
      $(parent).attr('drag', item.dom.id);
      event.dataTransfer.setData('Text', item.dom.id);
      item.addClass('item-curtain');
    });
    item.on('dragover', (event) => {
      event.preventDefault();
      const parent = item.parent();
      const itemNext = item.dom.nextSibling;
      const dragId = $(parent).attr('drag');
      const dragItem = $(parent).find(`#${dragId}`);
      const dragNext = dragItem.nextSibling;
      parent.insertBefore(item.dom, dragNext);
      parent.insertBefore(dragItem, itemNext);
    });
    item.on('drop', (event) => {
      event.preventDefault();
      const parent = item.parent();
      const itemNext = item.dom.nextSibling;
      const dragId = event.dataTransfer.getData('Text');
      const dragItem = $(parent).find(`#${dragId}`);
      const dragNext = dragItem.nextSibling;
      parent.insertBefore(item.dom, dragNext);
      parent.insertBefore(dragItem, itemNext);
      item.removeClass('item-curtain');
    });
    before.append(moveIcon);
    left.append(link).append(text);
    right.append(date);
    item.append(before).append(left).append(right);
    return item.dom;
  }

  createMission() {
    const form = this.formElement;
    const contentInput = $(form).find('input[name=content]');
    if (!contentInput.value) return false;
    const dateInput = $(form).find('input[type=date]');
    const item = { content: contentInput.value, date: dateInput.value };
    missions.ready()
      .then(() => missions.create(item))
      .then((id) => {
        const missionItem = Mission.createMissionItem(contentInput.value, dateInput.value, id);
        contentInput.value = '';
        dateInput.value = '';
        $(this.listElement).append(missionItem);
      });
    $(this.formElement).attr('data-item-id', '');
    return this;
  }

  updateMission() {
    const itemId = $(this.formElement).attr('data-item-id');
    if (!itemId) return false;
    const item = $(`#${itemId}`)[0];
    if (!item) throw new ReferenceError(`找不到#${itemId}元素`);
    const contentInput = $(this.formElement).find('input[name=content]');
    const dateInput = $(this.formElement).find('input[name=date]');
    const content = contentInput.value;
    const date = dateInput.value;
    const id = Number(itemId.match(/^item-(\d+)$/)[1]);
    const data = { id, content, date };
    missions.ready()
      .then(() => missions.save(data))
      .then(() => {
        $(item).find('*[name=content]').innerText = content;
        $(item).find('*[name=date]').innerText = date;
        $(item).removeClass('hide');
        contentInput.value = '';
        dateInput.value = '';
        $(this.formElement).addClass('hide');
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
