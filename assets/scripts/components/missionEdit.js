import model from '../model/mission';
import Dom from '../dom';
import datepicker from '../lib/datepicker';
import utils from '../utils';

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
    quadrant: '*[name=quadrant]',
  },
  methods: {
    init() {
      if (this.inited) { return false; }
      this.inited = 1;
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
          window.notice.methods.noticeIn(this.template, msg, 'error');
          return msg;
        }
        let date = new Date(this.elements.date.value);
        if (!utils.isValidDate(date)) { date = ''; }
        const quadrantSelected = this.elements.quadrant.value || 0;
        const quadrant = model.quadrants[quadrantSelected];
        const now = new Date();
        let promise;
        if (this.data.primaryKey) {
          promise = model.get(this.data.primaryKey)
            .then((res) => {
              const data = res[0];
              data.content = content;
              data.date = date;
              data.state = 'undone';
              data.important = quadrant.important;
              data.urgent = quadrant.urgent;
              data.updatedAt = now;
              return model.update(data);
            });
        } else {
          const data = {
            content,
            date,
            state: 'undone',
            important: quadrant.important,
            urgent: quadrant.urgent,
            createdAt: now,
            updatedAt: now,
          };
          promise = model.push(data);
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
      let promise = Promise.resolve(1);
      if (this.data.primaryKey) {
        promise = promise
          .then(() => model.get(this.data.primaryKey))
          .then((res) => {
            const data = res[0];
            Dom.of(this.elements.content).text(data.content);
            Dom.of(this.elements.date).attr('value', utils.formatDate(data.date));
            // 四象限选项
            const quadrantSelect = model.quadrants.findIndex((item) => {
              const isMatch = (item.important === !!data.important)
                && (item.urgent === !!data.urgent);
              return isMatch;
            });
            if (quadrantSelect > -1) {
              this.elements.quadrant.value = quadrantSelect;
            }
          });
      }
      return promise;
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
