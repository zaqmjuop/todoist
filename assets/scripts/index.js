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
    } else if (isElement(query) || (query === document)) {
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

  hasClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    return this.dom.classList.contains(content);
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

class Message {
  static prepareBox() {
    if (!document.body) throw new ReferenceError('页面加载未完成');
    let box = $('#alert-box')[0];
    if (!box) {
      box = $('<div>').attr('id', 'alert-box').dom;
      $(document.body).append(box);
    }
    return box;
  }

  static alert(message) {
    if (!message) throw new TypeError(`参数不能为${message}`);
    if (!document.body) throw new ReferenceError('页面加载未完成');
    const box = Message.prepareBox();
    const popup = $('<div>').addClass('alert');
    const content = $('<span>').attr('name', 'message').html(message);
    const buttons = $('<span>').attr('name', 'buttons');
    const cancel = $('<a>').attr('name', 'cancal').text('隐藏');
    cancel.on('click', () => {
      popup.dom.remove();
    });
    buttons.append(cancel);
    popup.append(content).append(buttons);
    $(box).append(popup);
    return popup;
  }

  static confirm(message, submitCallback, submitText) {
    if (!message) throw new TypeError(`参数不能为${message}`);
    if (!document.body) throw new ReferenceError('页面加载未完成');
    const box = Message.prepareBox();
    const popup = $('<div>').addClass('confirm');
    const content = $('<span>').attr('name', 'message').html(message);
    const buttons = $('<span>').attr('name', 'buttons');
    const submit = $('<a>').attr('name', 'submit').text('确定');
    if (isString(submitText)) {
      submit.text(submitText);
    }
    const cancel = $('<a>').attr('name', 'cancal').text('隐藏');
    if (submitCallback && (typeof submitCallback === 'function')) {
      submit.on('click', submitCallback);
    }
    cancel.on('click', () => {
      popup.dom.remove();
    });
    buttons.append(cancel);
    popup.append(content).append(buttons);
    $(box).append(popup);
    return popup;
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
    this.counter = 1;
    return this;
  }

  loadDB() {
    missions.ready()
      .then(() => missions.getAll())
      .then((results) => {
        const sort = results.sort((after, before) => (Number(after.order) - Number(before.order)));
        sort.forEach((result) => {
          const missionItem = Mission.createMissionItem(result.content, result.date, result.id);
          $(missionItem).attr('order', result.order);
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
      const missionItems = this.listElement.querySelectorAll('.mission-item');
      missionItems.forEach(item => $(item).removeClass('hide'));
      adderParent.insertBefore(this.formElement, this.adderElement);
      $(this.formElement).find('input[name=content]').value = '';
      $(this.formElement).find('input[name=date]').value = '';
      $(this.formElement).find('*[name=submit]').innerText = '添加任务';
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
      const handleId = $(this.formElement).attr('data-item-id');
      const handleItem = $(`#${handleId}`)[0];
      $(handleItem).removeClass('hide');
    });
    const finishItemButtons = $(this.listElement).children('*[name=finish]');
    finishItemButtons.forEach((button) => {
      $(button).on('click', () => {
        const item = $(button).parents('.mission-item')[0];
        $(item).remove();
      });
    });
    this.initDocument();
    this.init = 1;
    return this;
  }

  initDocument() {
    if (document.supportMission) return false;
    document.ondragover = (event) => {
      event.preventDefault();
    };
    document.ondrop = (event) => {
      const data = event.dataTransfer.getData('Text').match(/^item-\d+$/);
      const itemId = data && data[0];
      if (isString(itemId)) {
        const dragItem = $(`#${itemId}`)[0];
        if (!dragItem) return false;
        $(dragItem).removeClass('item-curtain').attr('draggable', 'false');
      }
      return true;
    };
    document.ondragend = () => {
      const missionItems = this.listElement.querySelectorAll('.mission-item');
      const dragId = $(this.listElement).attr('drag');
      const id = Number(dragId.match(/^item-(\d+)$/)[1]);
      const dragItem = $(`#${dragId}`)[0];
      let dragIndex;
      missionItems.forEach((item, index) => {
        if (dragItem.isSameNode(item)) dragIndex = index;
        $(item).removeClass('item-curtain').attr('draggable', 'false');
      });
      const prevItem = missionItems[dragIndex - 1];
      const nextItem = missionItems[dragIndex + 1];
      const prevOrder = (isElement(prevItem)) ? Number($(prevItem).attr('order')) : 0;
      const nextOrder = (isElement(nextItem)) ? Number($(nextItem).attr('order')) : (prevOrder + 2);
      if (!Number.isFinite(prevOrder) || !Number.isFinite(nextOrder)) throw new ReferenceError('拖动的条目前后存在条目没有有效order属性');
      const newOrder = (prevOrder + nextOrder) / 2;
      missions.ready()
        .then(() => missions.get(id))
        .then((result) => {
          const updateData = result;
          updateData.order = newOrder;
          return missions.set(updateData);
        }).then(() => {
          $(dragItem).attr('order', newOrder);
          Message.alert('位置已改变');
        });
      $(this.listElement).attr('drag', '');
    };
    $(document).on('click', (event) => {
      const isFormHide = $(this.formElement).hasClass('hide');
      if (isFormHide) return false;
      const paths = event.path;
      const hideFormButton = $(this.formElement).find('*[name=hide-form]');
      let isInMission = false;
      paths.forEach((element) => {
        if (!isElement(element)) return;
        if (this.element.isSameNode(element)) isInMission = true;
      });
      if (!isInMission) hideFormButton.click();
      return isInMission;
    });
    document.supportMission = 1;
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
    const submit = $(form).find('*[name=submit]');
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
    $(submit).text('保存');
    return form;
  }

  static createMissionItem(leftText, rightText, id) {
    if (!Mission.isElementComplete()) throw new ReferenceError('界面元素不完整');
    const item = $('<li>').addClass('mission-item').attr('id', `item-${id}`);
    const before = $('<div>').addClass('item-before');
    const moveIcon = $('<i>').addClass('fa fa-arrows');
    const left = $('<div>').addClass('item-left');
    const right = $('<div>').addClass('item-right');
    const icon = $('<i>').addClass('fa fa-circle-o item-icon fa-lg').attr('name', 'finish');
    const text = $('<span>').attr('name', 'content').text(leftText);
    const date = $('<span>').attr('name', 'date').addClass('text-sm-center').text(rightText);
    const link = $('<a>').append(icon);
    window.link = link;
    moveIcon.on('mousedown', () => {
      item.attr('draggable', 'true');
    });
    text.on('click', () => {
      Mission.transformItem(item.dom);
    });
    link.on('click', () => {
      missions.ready()
        .then(() => missions.delete(id))
        .then(() => item.remove());
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
      const index = { itemIndex: 0, dragIndex: 0 };
      const childNodes = parent.children;
      childNodes.forEach = Array.prototype.forEach;
      childNodes.forEach((node, i) => {
        if (item.dom.isSameNode(node)) index.itemIndex = i;
        if (dragItem.isSameNode(node)) index.dragIndex = i;
      });
      const positionItem = (index.dragIndex > index.itemIndex) ? item.dom : itemNext;
      parent.insertBefore(dragItem, positionItem);
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
      $(dragItem).removeClass('item-curtain').attr('draggable', 'false');
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
    this.counter += 1;
    const item = { content: contentInput.value, date: dateInput.value, order: this.counter };
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

  static hideForm() {
    const form = document.querySelector('#mission-form');
    if (!isElement(form)) throw new ReferenceError('没有找到mission-form');
    const hideFormButton = $(form).find('*[name=hide-form]');
    if (!isElement(form)) throw new ReferenceError('没有找到mission-form表单取消按钮');
    return hideFormButton.click();
  }

  static getElement() {
    return document.querySelector('#mission');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mission = new Mission();
  window.mission = mission;
  mission.createMission();
  window.show = () => (
    missions.ready()
      .then(() => missions.getAll())
      .then(result => console.log(result))
  );
});
