import Dom from '../dom';
import datepicker from '../lib/datepicker';
import Component from './component';

const param = {
  query: 'mission-form',
  url: './assets/components/missionForm.html',
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
      const content = this.present.content || '';
      const date = this.present.date || '';
      const id = this.present.id || '';
      const cid = this.present.cid || '';
      const submitText = (cid) ? '更新任务' : '新建任务';
      Dom.of(this.elements.contentInput).attr('value', content);
      Dom.of(this.elements.dateInput).attr('value', date);
      Dom.of(this.template).attr('data-item-id', id);
      Dom.of(this.template).attr('data-cid', cid);
      Dom.of(this.elements.submit).attr('text', submitText);
    },
    hide() {
      Dom.of(this.template).addClass('hide');
    },
    show() {
      Dom.of(this.template).removeClass('hide');
    },
  },
  created() {
    this.methods.show();
    if (!this.data.inited) {
      this.data.inited = 1;
      datepicker(this.elements.dateInput);
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
    }
    // 填充
    this.methods.fill();
  },
};

export default param;
