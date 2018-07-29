import missionForm from './missionForm';
import Component from './component';
import Dom from '../dom';
import mission from '../model';
import missionListItem from './missionListItem';
import utils from '../utils';

const dayMark = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const differDay = (datea, dateb) => {
  // 两个日期相差几日 返回值是一个整数 1代表dateb是datea的后一天 -1代表dateb是datea的前一天 0代表是同一天
  const dateaStart = new Date(datea.toLocaleDateString());
  const datebStart = new Date(dateb.toLocaleDateString());
  const msecs = datebStart.getTime() - dateaStart.getTime();
  const days = msecs / 86400000;
  return days;
};

const param = {
  query: 'mission-card',
  url: './assets/templates/missionCard.html',
  name: 'missionCard',
  data() {
    return {
      items: [],
      dayMark: '',
      dateMark: '',
    };
  },
  selectors: {
    form: 'mission-form',
    cardHeader: '.card-header',
    dayMark: '.day-mark',
    dateMark: '.date-mark',
    showForm: '.show-form',
    createMission: '.create-mission',
    cardBody: '.card-body',
  },
  components: [
    missionForm,
  ],
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.date = this.present.date;
      this.data.days = this.present.days;
      const promise = utils.newPromise()
        .then(() => this.methods.fill())
        .then(() => this.methods.initForm())
        .then(() => this.methods.loadDB())
        .then(() => this.methods.initItems());
      this.data.inited = 1;
      return promise;
    },
    initItems() {
      let promise = utils.newPromise();
      // 添加 li item
      this.data.items.forEach((item) => {
        promise = promise.then(() => this.methods.appendItem(item));
      });
      return promise;
    },
    loadDB() {
      let filter;
      if (this.data.days === 'all') {
        filter = mission.getAll();
      } else if (this.data.days === 'expired') {
        filter = mission.filter(item => item.date && (differDay(item.date, utils.now) > 0));
      } else if (this.data.date instanceof Date) {
        filter = mission.filter((item) => {
          const isMatch = item.date instanceof Date
            && this.present.date instanceof Date
            && differDay(item.date, this.present.date) === 0;
          return isMatch;
        });
      }
      const promise = filter.then((items) => {
        this.data.items = items;
        return this.data.items;
      });
      return promise;
    },
    fill() {
      if (this.data.date) {
        this.data.dateMark = `${this.data.date.getMonth() + 1}月${this.data.date.getDate()}日`;
        this.data.differDay = differDay(utils.now, this.data.date);
        if (this.data.differDay === 0) {
          this.data.dayMark = '今天';
        } else if (this.data.differDay === 1) {
          this.data.dayMark = '明天';
        } else {
          this.data.dayMark = dayMark[this.data.date.getDay()];
        }
      } else if (this.data.days === 'all') {
        this.data.dayMark = '所有';
      } else if (this.data.days === 'expired') {
        this.data.dayMark = '过期';
      }
      Dom.of(this.elements.dayMark).attr('text', this.data.dayMark);
      Dom.of(this.elements.dateMark).attr('text', this.data.dateMark);
      return this;
    },
    appendItem(detail) {
      // 添加li item
      const present = Object.assign(detail);
      present.formId = this.data.formId;
      const itemParam = Object.assign({ present }, missionListItem);
      const position = Dom.of(this.elements.form).getIndex();
      const append = this.appendChild(itemParam, this.elements.cardBody, position);
      return append;
    },
    initForm() {
      const form = this.findBy({ name: missionForm.name });
      if (!form) { return false; }
      this.data.form = form;
      this.data.formId = form.componentId;
      // 默认隐藏表单
      form.methods.hide().methods.fill();
      // 显示表单
      Dom.of(this.elements.showForm).on('click', () => {
        // 还原li item
        const promise = form.methods.reduce()
          .then(() => {
            const position = Dom.of(this.elements.createMission).getIndex();
            return this.appendChild(form, this.elements.cardBody, position);
          }).then(() => {
            form.present = { date: this.data.date };
            form.methods.show();
          });
        return promise;
      });
      // 创建item
      form.addEventListener('create', (e) => {
        if (!e.detail.content) { return false; }
        const present = {
          content: e.detail.content,
          date: new Date(e.detail.date),
        };
        const promise = mission.push(present)
          .then((primaryKey) => {
            // 添加li item
            present.primaryKey = primaryKey;
            return this.methods.appendItem(present);
          })
          .then(() => form.methods.hide());
        return promise;
      });
      // 更新item
      form.addEventListener('update', (e) => {
        if (!e.detail.content) { return false; }
        const upData = {
          content: e.detail.content,
          date: e.detail.date,
          primaryKey: e.detail.primaryKey,
        };
        const present = Object.assign({
          cid: this.componentId,
          formId: this.data.formId,
        }, upData);
        mission.update(upData)
          .then((primaryKey) => {
            // 更新后将form替换为li
            const li = Component.findBy({ componentId: Number(e.detail.cid) });
            present.primaryKey = primaryKey;
            li.present = present;
            li.methods.fill();
            this.replaceChild(li, this.data.form);
          })
          .then(() => form.methods.hide());
        return present;
      });
      return form;
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
