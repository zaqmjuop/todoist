import Dom from '../dom';
import datepicker from '../lib/datepicker';
import Component from './component';

const param = {
  query: 'mission-form',
  url: './assets/components/missionForm.html',
  name: 'missionForm',
  data() {
    return {
      inited: 0,
    };
  },
  selectors: {
    contentInput: 'input[name=content]',
    dateInput: 'input[name=date]',
    cancelForm: '.cancel-form',
    submit: '.submit',
  },
  methods: {
    formSubmit() {
      // 提交表单
      const content = Dom.of(this.elements.contentInput).attr('value');
      if (!content) { return false; } // 如果没有内容就取消操作
      const date = Dom.of(this.elements.dateInput).attr('value') || '';
      const id = Dom.of(this.template).attr('data-item-id');
      const cid = Dom.of(this.template).attr('data-cid');
      const data = { content, date };
      if (!id) {
        this.dispatchEvent('create', data);
      } else {
        data.id = Number(id);
        data.cid = cid;
        this.dispatchEvent('update', data);
      }
      return data;
    },
    fill() {
      this.present = this.present || {};
      this.data.content = this.present.content || '';
      this.data.date = this.present.date || '';
      this.data.id = this.present.id || '';
      this.data.cid = this.present.cid || '';
      this.data.submitText = (this.data.cid) ? '更新任务' : '新建任务';
      Dom.of(this.elements.contentInput).attr('value', this.data.content);
      Dom.of(this.elements.dateInput).attr('value', this.data.date);
      Dom.of(this.template).attr('data-item-id', this.data.id);
      Dom.of(this.template).attr('data-cid', this.data.cid);
      Dom.of(this.elements.submit).attr('text', this.data.submitText);
    },
    hide() {
      Dom.of(this.template).addClass('hide');
      return this;
    },
    show() {
      Dom.of(this.template).removeClass('hide');
      return this;
    },
    selectDate(date) {
      if (!(date instanceof Date)) {
        throw new TypeError(`${date} 不是Date的实例对象`);
      }
    },
    init() {
      if (this.data.inited) { return false; }
      const picker = datepicker(this.elements.dateInput);
      Dom.of(picker.body).attr('data-c-id', `c${this.componentId}`);
      this.methods.bindEvents();
      this.data.inited = 1;
      return this;
    },
    bindEvents() {
      if (this.data.inited) { return false; }
      Dom.of(this.elements.submit).on('click', () => {
        // 提交
        this.methods.formSubmit();
      });
      Dom.of(this.elements.cancelForm).on('click', (event) => {
        // 隐藏form 如果template有data-cid属性则应先还原
        event.stopPropagation();
        const beforeCid = Dom.of(this.template).attr('data-cid');
        if (beforeCid) {
          const beforeComponent = Component.find(beforeCid);
          if (beforeComponent) {
            this.replaceSelf(beforeComponent);
          }
        } else {
          this.methods.hide();
        }
        this.elements.contentInput.blur();
      });
      return this;
    },
  },
  created() {
    this.methods.init();
    this.methods.show();
    // 填充
    this.methods.fill();
  },
};

export default param;
