import model from '../model';
import Dom from '../dom';
import datepicker from '../lib/datepicker';
import utils from '../utils';

/*
{}
content
:
"少时诵诗书所所所所所所所所所所所所所所所少时诵诗书所所所所所所所所所所所所所所所所"
date
:
Sun Jul 29 2018 00:00:00 GMT+0800 (中国标准时间) {}
primaryKey
:
4
state
:
"undone"
*/

const param = {
  query: 'mission-edit',
  url: './assets/templates/missionEdit.html',
  name: 'missionEdit',
  data() {
    return {};
  },
  selectors: {
    content: 'textarea',
    date: 'input[name=date]',
    cancal: '*[name=cancal]',
    submit: '*[name=submit]',
  },
  methods: {
    init() {
      if (this.inited) { return false; }
      this.inited = 1;
      console.log(this.present);
      this.data.action = (this.present.primaryKey) ? 'update' : 'create';
      this.data.picker = datepicker(this.elements.date);
      Dom.of(this.data.picker.body).attr('data-c-id', `c${this.componentId}`);
      const promise = Promise.resolve(1)
        .then(() => this.methods.loadDB())
        .then(() => this.methods.bindEvents())
        .then(() => this.methods.fill());
      return promise;
    },
    bindEvents() {
      // 撤销按钮
      Dom.of(this.elements.cancal).on('click', () => {
        window.router.methods.render('welcome');
      });
      // 提交按钮
      Dom.of(this.elements.submit).on('click', () => {
        const content = this.elements.content.value;
        if (!utils.isEffectiveString(content)) {
          const msg = '内容不能为空';
          const notice = window.notice.methods.render(msg, 'error');
          Dom.of(this.template).appendAccurate(notice, 0);
          return msg;
        }
        let date = new Date(this.elements.date.value);
        if (!utils.isValidDate(date)) {
          date = '';
        }
        const detail = { content, date, state: 'undone' };
        let promise;
        if (this.data.primaryKey) {
          detail.primaryKey = this.data.primaryKey;
          promise = model.update(detail);
        } else {
          promise = model.push(detail);
        }
        return promise.then(() => {
          window.router.methods.render('welcome');
          const msg = '保存成功';
          window.notice.methods.alert(msg, 'success');
          return msg;
        });
      });
    },
    loadDB() {
      if (this.data.action === 'create') {
        return Promise.resolve(1);
      }
      const promise = model.get(this.present.primaryKey)
        .then((items) => {
          const item = items[0];
          const attrs = Object.keys(item);
          attrs.forEach((attr) => {
            this.data[attr] = item[attr];
          });
        });
      return promise;
    },
    fill() {
      Dom.of(this.elements.content).text(this.data.content);
      Dom.of(this.elements.date).attr('value', utils.formatDate(this.data.date));
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
