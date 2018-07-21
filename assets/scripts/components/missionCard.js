import missionForm from './missionForm';
import Component from './component';
import Dom from '../dom';
import missions from '../indexeddb/missions';
import missionListItem from './missionListItem';

const now = new Date();
const dayMark = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    throw new TypeError(`${date}不是Date的实例化对象`);
  }
  return date.toLocaleDateString().replace(/\//g, '-');
};

// 两个日期相差几日 返回值是一个整数 1代表dateb是datea的后一天 -1代表dateb是datea的前一天 0代表是同一天
const differDay = (datea, dateb) => {
  const dateaStart = new Date(datea.toLocaleDateString());
  const datebStart = new Date(dateb.toLocaleDateString());
  const msecs = datebStart.getTime() - dateaStart.getTime();
  const days = msecs / 86400000;
  return days;
};

const param = {
  query: 'mission-card',
  url: './assets/components/missionCard.html',
  name: 'missionCard',
  data() {
    return {};
  },
  selectors: {
    form: 'mission-form',
    cardHeader: '.card-header',
    dayMark: '.day-mark',
    dateMark: '.date-mark',
    showForm: '.show-form',
    createMission: '.create-mission',
  },
  components: [
    missionForm,
  ],
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.now = now;
      this.methods.fill();
      this.methods.loadDB();
      this.methods.initForm();
      this.data.inited = 1;
      return this;
    },
    loadDB() {
      if (!this.data.date) { return false; }
      const promise = missions.ready().then(() => {
        const items = missions.findItems({ date: formatDate(this.data.date) });
        return items;
      }).then((items) => {
        items.map((item) => {
          // 添加 li item
          const present = Object.assign(item, { cid: this.componentId, formId: this.data.formId });
          const itemParam = Object.assign({ present }, missionListItem);
          const position = Dom.of(this.elements.form).getIndex();
          this.appendChild(itemParam, this.elements.form, position);
          return this;
        });
      });
      return promise;
    },
    fill() {
      if (this.present.date) {
        this.data.date = this.present.date;
        this.data.dayMark = dayMark[this.data.date.getDay()];
        this.data.dateMark = `${this.data.date.getMonth() + 1}月${this.data.date.getDate()}日`;
        this.data.differDay = differDay(this.data.now, this.data.date);
        if (this.data.differDay === 0) {
          this.data.dayMark = '今天';
        } else if (this.data.differDay === 1) {
          this.data.dayMark = '明天';
        }
        Dom.of(this.elements.dayMark).attr('text', this.data.dayMark);
        Dom.of(this.elements.dateMark).attr('text', this.data.dateMark);
      }
      return this;
    },
    appendItem(detail) {
      // 添加li item
      const present = detail || {};
      present.cid = this.componentId;
      present.formId = this.data.formId;
      const itemParam = Object.assign({ present }, missionListItem);
      const insert = this.insertComponent(itemParam, this.elements.form, -1);
      return insert;
    },
    initForm() {
      const form = this.findBy({ name: missionForm.name });
      this.data.formId = form.componentId;
      if (this.data.date) {
        const fillFormDate = formatDate(this.data.date);
        form.present.date = fillFormDate;
        form.methods.hide().methods.fill();
      }
      // 显示表单
      Dom.of(this.elements.showForm).on('click', () => {
        const pastCid = form.data.cid;
        if (pastCid) {
          const pastItem = Component.find(pastCid);
          if (pastItem) {
            form.replaceSelf(pastItem);
          }
        }
        form.present = {};
        form.methods.show().methods.selectDate(this.data.date);
        Dom.of(form.template).insertBefore(this.elements.createMission);
      });
      // 创建
      form.addEventListener('create', (e) => {
        if (!e.detail.content) { return false; }
        missions.ready().then(() => {
          const create = missions.set(e.detail);
          return create;
        }).then((id) => {
          // 添加 li item
          const present = Object.assign({
            id,
            cid: this.componentId,
            formId: this.data.formId,
          }, e.detail);
          const itemParam = Object.assign({ present }, missionListItem);
          const position = Dom.of(this.elements.form).getIndex();
          const append = this.appendChild(itemParam, this.elements.form, position);
          return append;
        }).then(() => {
          form.present = {};
          form.methods.hide();
        });
        return this;
      });
      // 更新
      form.addEventListener('update', (e) => {
        if (!e.detail.content) { return false; }
        const updateData = {
          content: e.detail.content,
          date: e.detail.date,
          id: e.detail.id,
        };
        missions.ready().then(() => {
          const save = missions.set(updateData);
          return save;
        }).then(() => {
          // 更新后将form替换为li
          const li = Component.find(e.detail.cid);
          li.present.content = updateData.content;
          li.present.date = updateData.date;
          li.present.id = updateData.id;
          form.replaceSelf(li);
          form.present = {};
        });
        return form;
      });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
