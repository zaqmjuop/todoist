import Dom from '../dom';
import mission from '../model';
import Component from './component';
import utils from '../utils';

const param = {
  query: 'mission-list-item',
  url: './assets/templates/missionListItem.html',
  name: 'missionListItem',
  selectors: {
    template: '.template',
    content: '.item-content',
    date: '.item-date',
    finish: '.finish',
    itemMain: '.item-main',
    counter: '#counter',
    remove: 'a[name=remove]',
    update: 'a[name=update]',
    toggle: 'input[name=toggle]',
  },
  data() {
    return {
      counter: 1,
      inited: 0,
    };
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.bindEvents();
      return this;
    },
    bindEvents() {
      // 切换任务状态
      const toggle = Dom.of(this.elements.toggle);
      toggle.on('click', () => {
        const toggleState = (toggle.dom.checked) ? 'done' : 'undone';
        const data = {
          content: this.present.content,
          date: (utils.isValidDate(this.present.date)) ? this.present.date : '',
          primaryKey: Number(this.present.primaryKey),
          state: toggleState,
        };
        mission.update(data).then(() => {
          this.data.state = data.state;
          if (toggleState === 'done') {
            Dom.of(this.template).addClass('done');
          } else {
            Dom.of(this.template).removeClass('done');
          }
        });
      });
      // 更新自己
      Dom.of(this.elements.content).on('click', () => {
        // 替换当前组件为missionForm
        // 如果missionForm有data-cid属性 说明missionForm被其他组件替换，应先还原
        if (!this.data.formId) { throw new Error(`Item.data.formId不能为${this.data.formId}`); }
        let promise = utils.newPromise();
        const missionForm = Component.findBy({ componentId: Number(this.data.formId) });
        const detail = {
          cid: this.componentId,
          content: this.data.content,
          date: this.data.date,
          primaryKey: this.present.primaryKey,
          formId: this.data.formId,
        };
        missionForm.present = detail;
        promise = promise
          .then(() => missionForm.methods.reduce())
          .then(() => this.replace(missionForm))
          .then(() => {
            missionForm.present = detail;
            missionForm.methods.show();
          });
        return promise;
      });
      // 更新按钮
      Dom.of(this.elements.update).on('click', () => this.elements.content.click());
      // 删除按钮
      Dom.of(this.elements.remove).on('click', () => {
        const promise = mission.remove(this.present.primaryKey)
          .then(() => {
            this.template.style.height = '0px';
            this.template.style.paddingTop = '0px';
            this.template.style.paddingBottom = '0px';
            const t = setTimeout(() => this.parent.removeChild(this), 1000);
            return t;
          });
        return promise;
      });
    },
    fill() {
      this.present = this.present || {};
      this.data.content = this.present.content;
      this.data.date = this.present.date;
      this.data.primaryKey = this.present.primaryKey;
      this.data.formId = this.present.formId;
      this.data.state = this.present.state || 'undone';
      const dateStr = utils.formatDate(this.present.date);
      Dom.of(this.elements.content).attr('text', this.present.content);
      Dom.of(this.elements.date).attr('text', dateStr);
      if (this.present.date instanceof Date && utils.differDay(this.present.date, utils.now) > 0) {
        Dom.of(this.elements.date).addClass('expired');
      }
      Dom.of(this.template).attr('data-primaryKey', this.present.primaryKey);
      if (this.present.state === 'done') {
        Dom.of(this.template).addClass('done');
        this.elements.toggle.checked = 1;
      } else {
        Dom.of(this.template).removeClass('done');
        this.elements.toggle.checked = 0;
      }
    },
  },
  created() {
    this.methods.init();
    this.methods.fill();
  },
};

export default param;
