

class Dialog {
  static createDialogElement() {
    const body = document.querySelector('body');
    if (!body) throw new ReferenceError('页面主体没有加载完');
    const dialog = document.createElement('DIV');
    dialog.setAttribute('class', 'dialog');
    const curtain = document.createElement('DIV');
    curtain.setAttribute('class', 'curtain');
    const alert = document.createElement('DIV');
    alert.setAttribute('class', 'alert');
    const msg = document.createElement('DIV');
    msg.setAttribute('class', 'msg');
    const buttonGroup = document.createElement('DIV');
    buttonGroup.setAttribute('class', 'alert-buttons');
    const submit = document.createElement('BUTTON');
    submit.innerText = '确定';
    buttonGroup.appendChild(submit);
    alert.appendChild(msg);
    alert.appendChild(buttonGroup);
    dialog.appendChild(curtain);
    dialog.appendChild(alert);
    submit.onclick = () => {
      body.removeChild(dialog);
    };
    return dialog;
  }
  //  <div class="dialog">
  //   <div class="curtain"></div>
  //   <div class="alert">
  //     <span class="msg">asd</span>
  //     <div class="text-right">
  //       <button>确定</button>
  //     </div>
  //   </div>
  // </div>

  static alert(message) {
    if (!message || (typeof message !== 'string')) throw new TypeError('参数只能是字符串');
    const body = document.querySelector('body');
    if (!body) throw new ReferenceError('页面主体没有加载完');
    const dialog = Dialog.createDialogElement();
    const msg = dialog.querySelector('.msg');
    if (!msg) throw new ReferenceError('dialog不完整');
    msg.innerText = message;
    return body.appendChild(dialog);
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
    return this;
  }

  static isElementComplete() {
    const element = document.querySelector('#mission');
    const listElement = document.querySelector('#mission-list');
    const formElement = document.querySelector('#mission-form');
    const adderElement = document.querySelector('#add-mission');
    return element && listElement && formElement && adderElement;
  }

  static createMissionItem() {
    if (!Mission.isElementComplete()) throw new ReferenceError('界面元素不完整');
    // <li class="mission-item">
    //   <div class="item-left">
    //     <i class="fa fa-circle-o item-icon"></i>
    //     <span>健身房续费 #健康</span>
    //   </div>
    //   <div class="item-right">
    //     <span class="text-sm-center">2019年5月1日</span>
    //   </div>
    // </li>
  }

  createMission() {
    const textInput = this.formElement.querySelector('input[type=text]');
    if (!textInput) throw new ReferenceError('表单元素不完整');
    const article = textInput.value;
    if (!article) return false;

    return this;
  }

  static getElement() {
    return document.querySelector('#mission');
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  // Dialog.alert('fick');
  window.mission = new Mission();
});
