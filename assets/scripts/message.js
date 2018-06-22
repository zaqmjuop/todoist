import Utils from './utils';
import Dom from './dom';

const $ = Dom.of;

class Message {
  static prepareBox() {
    if (!document.body) { throw new ReferenceError('页面加载未完成'); }
    let box = $('#alert-box')[0];
    if (!box) {
      box = $('<div>').attr('id', 'alert-box').dom;
      $(document.body).append(box);
    }
    return box;
  }

  static alert(message) {
    if (!message) { throw new TypeError(`参数不能为${message}`); }
    if (!document.body) { throw new ReferenceError('页面加载未完成'); }
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
    if (!message) { throw new TypeError(`参数不能为${message}`); }
    if (!document.body) { throw new ReferenceError('页面加载未完成'); }
    const box = Message.prepareBox();
    const popup = $('<div>').addClass('confirm');
    const content = $('<span>').attr('name', 'message').html(message);
    const buttons = $('<span>').attr('name', 'buttons');
    const submit = $('<a>').attr('name', 'submit').text('确定');
    if (Utils.isString(submitText)) {
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

export default Message;
