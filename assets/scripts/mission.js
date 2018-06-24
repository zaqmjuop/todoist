import missions from './indexeddb/missions';
import Utils from './utils';
import Dom from './dom';
import Message from './message';

const $ = Dom.of;

class Mission {
  constructor() {
    if (Mission.instance instanceof Mission) return Mission.instance;
    this.element = document.querySelector('#mission');
    this.listElement = document.querySelector('#mission-list');
    this.formElement = document.querySelector('#mission-form');
    this.adderElement = document.querySelector('#add-mission');
    this.leftMenu = document.querySelector('#left-menu');
    this.navbar = document.querySelector('nav');
    this.contentHeader = this.element.querySelector('*[name=content-header]');
    if (!this.element || !this.listElement || !this.formElement || !this.adderElement) {
      throw new ReferenceError('界面元素不完整');
    }
    this.init();
    this.loadDB();
    this.counter = 1;
    Mission.instance = this;
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
    const openForm = $(this.adderElement).child('*[name=open-form]');
    $(openForm).on('click', () => {
      const adderParent = $(this.adderElement).parent();
      const missionItems = this.listElement.querySelectorAll('.mission-item');
      missionItems.forEach(item => $(item).removeClass('hide'));
      adderParent.insertBefore(this.formElement, this.adderElement);
      $(this.formElement).child('input[name=content]').value = '';
      $(this.formElement).child('input[name=date]').value = '';
      $(this.formElement).child('*[name=submit]').innerText = '添加任务';
      $(this.formElement).attr('data-item-id', '').removeClass('hide');
    });
    const submit = $(this.formElement).child('button[name=submit]');
    $(submit).on('click', () => {
      const itemId = $(this.formElement).attr('data-item-id');
      if (!itemId) {
        this.createMission();
      } else {
        this.updateMission();
      }
    });
    // todo
    const formInputs = $(this.formElement).children('input');
    formInputs.forEach((input) => {
      $(input).on('keypress', (event) => {
        if (Utils.isKeyEnter(event)) {
          submit.click();
        }
      });
    });
    const hideForm = $(this.formElement).child('*[name=hide-form]');
    $(hideForm).on('click', () => {
      $(this.formElement).addClass('hide');
      const handleId = $(this.formElement).attr('data-item-id');
      if (handleId) {
        const handleItem = $(`#${handleId}`)[0];
        if (handleItem) $(handleItem).removeClass('hide');
      }
    });
    const finishItemButtons = $(this.listElement).children('*[name=finish]');
    finishItemButtons.forEach((button) => {
      $(button).on('click', () => {
        const item = $(button).parents('.mission-item')[0];
        $(item).remove();
      });
    });
    this.initDocument();
    this.initWindow();
    this.initContentHeader();
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
      if (Utils.isString(itemId)) {
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
      const prevOrder = (Utils.isElement(prevItem)) ? Number($(prevItem).attr('order')) : 0;
      const nextOrder = (Utils.isElement(nextItem)) ? Number($(nextItem).attr('order')) : (prevOrder + 2);
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
    // $(document).on('click', (event) => {
    //   // 点击任务列表以外的区域，则隐藏新建任务的表单
    //   const isFormHide = $(this.formElement).hasClass('hide');
    //   if (isFormHide) return false;
    //   const paths = event.path;
    //   const hideFormButton = $(this.formElement).find('*[name=hide-form]');
    //   let isInMission = false;
    //   paths.forEach((element) => {
    //     if (!Utils.isElement(element)) return;
    //     if (this.element.isSameNode(element)) isInMission = true;
    //   });
    //   if (!isInMission) hideFormButton.click();
    //   return isInMission;
    // });
    document.supportMission = 1;
    return this;
  }

  initWindow() {
    if (window.supportMission) return false;
    window.onresize = () => {
      this.readjustLeftMenuHeight();
    };
    window.addEventListener('load', () => {
      this.readjustLeftMenuHeight();
    });
    window.supportMission = 1;
    return this;
  }

  initContentHeader() {
    const sortIcon = this.contentHeader.querySelector('*[name=sort]');
    const sortMenu = sortIcon.nextElementSibling;
    const sortCurtain = sortMenu.querySelector('.curtain');
    if (Utils.isElement(sortIcon)) {
      sortIcon.addEventListener('click', () => {
        $(sortMenu).toggleClass('hide');
      });
    }
    if (Utils.isElement(sortCurtain)) {
      sortCurtain.addEventListener('mousedown', (event) => {
        $(sortMenu).addClass('hide');
        event.stopPropagation();
      });
    }
  }

  readjustLeftMenuHeight() {
    this.leftMenu.style.height = `${window.innerHeight - 100}px`;
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
    if (!Utils.isElement(missionItem) || !missionItem.classList.contains('mission-item')) throw new TypeError('不是任务列表的子元素');
    const parent = $(missionItem).parent();
    const nextItem = missionItem.nextSibling;
    const form = $('#mission-form')[0];
    const content = $(missionItem).child('*[name=content]').innerText;
    const date = $(missionItem).child('*[name=date]').innerText;
    const missionItems = parent.querySelectorAll('.mission-item');
    const submit = $(form).child('*[name=submit]');
    missionItems.forEach((item) => {
      if (item.id !== missionItem.id) {
        $(item).removeClass('hide');
      }
    });
    $(missionItem).addClass('hide');
    parent.insertBefore(form, nextItem);
    $(form).removeClass('hide').attr('data-item-id', missionItem.id);
    $(form).child('input[name=content]').value = content;
    $(form).child('input[name=date]').value = date;
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
      const dragItem = $(parent).child(`#${dragId}`);
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
      const dragItem = $(parent).child(`#${dragId}`);
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
    const contentInput = $(form).child('input[name=content]');
    if (!contentInput.value) return false;
    const dateInput = $(form).child('input[name=date]');
    this.counter += 1;
    const item = { content: contentInput.value, date: dateInput.value, order: this.counter };
    missions.ready()
      .then(() => missions.create(item))
      .then((id) => {
        const missionItem = Mission.createMissionItem(contentInput.value, dateInput.value, id);
        contentInput.value = '';
        dateInput.value = '';
        //
        $(this.listElement).append(missionItem);
        //
      });
    $(this.formElement).attr('data-item-id', '');
    return this;
  }

  updateMission() {
    const itemId = $(this.formElement).attr('data-item-id');
    if (!itemId) return false;
    const item = $(`#${itemId}`)[0];
    if (!item) throw new ReferenceError(`找不到#${itemId}元素`);
    const contentInput = $(this.formElement).child('input[name=content]');
    const dateInput = $(this.formElement).child('input[name=date]');
    const content = contentInput.value;
    const date = dateInput.value;
    const id = Number(itemId.match(/^item-(\d+)$/)[1]);
    const data = { id, content, date };
    missions.ready()
      .then(() => missions.save(data))
      .then(() => {
        $(item).child('*[name=content]').innerText = content;
        $(item).child('*[name=date]').innerText = date;
        $(item).removeClass('hide');
        contentInput.value = '';
        dateInput.value = '';
        $(this.formElement).addClass('hide');
      });
    return this;
  }

  sortMissionsByDate(option) {
    const missionItems = this.listElement.querySelectorAll('.mission-item');
    const items = [];
    missionItems.forEach((item) => {
      items.push(item);
    });
    const sort = items.sort((item1, item2) => {
      const date1 = item1.querySelector('*[name=date]').innerText;
      const date2 = item2.querySelector('*[name=date]').innerText;
      const time1 = (date1) ? new Date(date1).getTime() : 0;
      const time2 = (date2) ? new Date(date2).getTime() : 0;
      return time1 >= time2;
    });
    const result = (option === 'reverse') ? sort.reverse() : sort;
    result.forEach((item, index) => {
      const order = index + 1;
      const content = item.querySelector('*[name=content]').innerText;
      const date = item.querySelector('*[name=date]').innerText;
      const id = Number(item.id.match(/^item-(\d+)$/)[1]);
      const updateData = {
        id, content, date, order,
      };
      missions.ready()
        .then(() => missions.set(updateData))
        .then(() => {
          item.setAttribute('order', order);
          this.listElement.appendChild(item);
        });
    });
  }

  static hideForm() {
    // 隐藏新建任务表单
    const form = document.querySelector('#mission-form');
    if (!Utils.isElement(form)) throw new ReferenceError('没有找到mission-form');
    const hideFormButton = $(form).child('*[name=hide-form]');
    if (!Utils.isElement(form)) throw new ReferenceError('没有找到mission-form表单取消按钮');
    return hideFormButton.click();
  }

  static getElement() {
    return document.querySelector('#mission');
  }
}

export default Mission;
