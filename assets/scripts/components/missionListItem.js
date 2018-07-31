import Dom from '../dom';
import mission from '../model';
import Component from './component';
import utils from '../utils';

const param = {
  query: 'mission-list-item',
  url: './assets/templates/missionListItem.html',
  name: 'missionListItem',
  selectors: {
    content: '.item-content',
    date: '.item-date',
    finish: '.finish',
    itemMain: '.item-main',
    counter: '#counter',
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
      Dom.of(this.elements.finish).on('click', () => {
        const toggleState = (this.present.state === 'done') ? 'undone' : 'done';
        const data = {
          content: this.present.content,
          date: (utils.isValidDate(this.present.date)) ? this.present.date : '',
          primaryKey: Number(this.present.primaryKey),
          state: toggleState,
        };
        mission.update(data).then(() => {
          Dom.of(this.template).toggleClass('done');
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
          id: this.data.id,
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
    },
    fill() {
      this.present = this.present || {};
      this.data.content = this.present.content;
      this.data.date = this.present.date;
      this.data.id = this.present.id;
      this.data.formId = this.present.formId;
      const dateStr = utils.formatDate(this.present.date);
      Dom.of(this.elements.content).attr('text', this.present.content);
      Dom.of(this.elements.date).attr('text', dateStr);
      Dom.of(this.template).attr('data-item-id', this.present.id);
      if (this.present.state === 'done') {
        Dom.of(this.template).addClass('done');
      }
    },
  },
  created() {
    this.methods.init();
    this.methods.fill();
    console.log('item', this.present)
  },
};

export default param;
