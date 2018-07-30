import Dom from '../dom';
import datepicker from '../lib/datepicker';
import Component from './component';
import utils from '../utils';


const param = {
  query: 'mission-form',
  url: './assets/templates/missionForm.html',
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
      if (!content) { window.alert('请输入任务内容'); } // 如果没有内容就取消操作
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
      Dom.of(this.elements.dateInput).attr('value', this.methods.formatDate(this.data.date));
      Dom.of(this.template).attr('data-item-id', this.data.id);
      Dom.of(this.template).attr('data-cid', this.data.cid);
      Dom.of(this.elements.submit).attr('text', this.data.submitText);
    },
    formatDate(parameter) {
      // parameter可以是表示时间字符串 如'2018/01/01'或'2018-01-01'或Date
      // 返回表示时间的字符串格式'2018-01-01'
      const date = (parameter && parameter instanceof Date)
        ? parameter
        : new Date(String(parameter));
      const result = (date.getTime()) ? date.toLocaleDateString().replace(/\//g, '-') : '';
      return result;
    },
    clear() {
      this.present = {};
      this.methods.fill();
    },
    hide() {
      this.methods.clear();
      Dom.of(this.template).addClass('hide');
      return this;
    },
    show() {
      this.methods.fill();
      Dom.of(this.template).removeClass('hide');
      return this;
    },
    init() {
      if (this.data.inited) { return false; }
      this.data.picker = datepicker(this.elements.dateInput);
      Dom.of(this.data.picker.body).attr('data-c-id', `c${this.componentId}`);
      this.methods.bindEvents();
      this.data.inited = 1;
      return this;
    },
    reduce() {
      // 还原missionListItem
      if (!this.data.cid) { return utils.newPromise(); }
      const pastItem = Component.findBy({ componentId: Number(this.data.cid) });
      if (!pastItem) { throw new ReferenceError(`componentId:${this.data.cid}的Item未找到`); }
      const promise = this.replace(pastItem)
        .then(() => {
          this.present = {};
          this.methods.fill();
          this.methods.hide();
          return this;
        });
      return promise;
    },
    bindEvents() {
      if (this.data.inited) { return false; }
      Dom.of(this.elements.submit).on('click', (event) => {
        // 提交
        event.stopPropagation();
        this.methods.formSubmit();
      });
      Dom.of(this.elements.cancelForm).on('click', (event) => {
        // 隐藏form 如果template有data-cid属性则应先还原
        event.stopPropagation();
        return this.methods.reduce().then(() => this.methods.hide());
      });
      return this;
    },
  },
  created() {
    this.methods.init();
    this.methods.show();
  },
};

export default param;
