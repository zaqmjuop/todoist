import missionListItemParam from './missionListItem';
import missionForm from './missionForm';
import missions from '../indexeddb/missions';
import Component from './component';
import Dom from '../dom';

const now = new Date();

const param = {
  query: 'mission-card-expired',
  url: './assets/components/missionCardExpired.html',
  name: 'missionCardExpired',
  data() {
    return {

    };
  },
  components: [
    missionForm,
  ],
  selectors: {
    cardBody: '.card-body',
    dayMark: '.day-mark',
    form: 'mission-form',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      Dom.of(this.elements.dayMark).text('过期');
      this.methods.initForm();
      this.methods.loadDB();
      return this;
    },
    initForm() {
      const form = this.findBy({ name: missionForm.name });
      this.data.formId = form.componentId;
      form.methods.hide();
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
    appendItem(detail) {
      // 添加li item
      const present = detail || {};
      present.cid = this.componentId;
      present.formId = this.data.formId;
      const itemParam = Object.assign({ present }, missionListItemParam);
      //
      try {
        const position = Dom.of(this.elements.form).getIndex();
        this.appendChild(itemParam, this.elements.form, position);
      } catch (error) {
        const position = Dom.of(this.elements.form).getIndex();
        console.log('error', this.elements.form, error, position)
      }
      //
      const position = Dom.of(this.elements.form).getIndex();
      const append = this.appendChild(itemParam, this.elements.form, position);
      return append;
    },
    loadDB() {
      // 筛选过期任务
      let promise = new Promise(resolve => resolve(1));
      missions.ready().then(() => {
        const promiseAll = missions.getAll();
        return promiseAll;
      }).then((datas) => {
        const filter = datas.filter((item) => {
          if (!item.date) { return false; }
          const date = new Date(item.date);
          const isExpired = (now > date) && (now.getDate() !== date.getDate());
          return isExpired;
        });
        const sortByDate = filter.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() > dateB.getTime();
        });
        return sortByDate;
      }).then((details) => {
        details.forEach((detail) => {
          promise = promise.then(() => {
            const present = Object.assign(detail, { formId: this.data.formId });
            const append = this.methods.appendItem(present);
            return append;
          });
        });
      });
      return promise;
    },
  },
  created() {
    this.methods.init();
  },
};


export default param;
