import missionForm from './missionForm';
import Component from './component';
import Dom from '../dom';
import mission from '../model';
import missionListItem from './missionListItem';
import utils from '../utils';

const dayMark = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

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
  passon: [], // 接受父组件全部present
  selectors: {
    form: 'mission-form',
    cardHeader: '.card-header',
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
      const filter = mission.methods.getQuery(this.present.query);
      const promise = filter
        .then((items) => {
          const bysSate = utils.divisio(items, item => (item.state !== 'done')); // [[未完成], [已完成]]
          const byDate = bysSate.map((ary) => {
            const allot = utils.divisio(ary, item => utils.isValidDate(item.date));
            return allot;
          });
          // byDate
          // [
          //   [
          //     ['有日期 未完成'], ['无日期 未完成']
          //   ],
          //   [
          //     ['有日期 已完成'], ['无日期 已完成']
          //   ],
          // ]
          const deep = byDate.map((states) => {
            const sortByDate = states[0].sort((a, b) => (a.date >= b.date));
            return [sortByDate, states[1]];
          });
          const flat = utils.flat(deep, 2);
          // flat 未完成在前，有日期的在前，日期升序 一维数组
          this.data.items = flat;
          return this.data.items;
        });
      // todo sort 未完成在前， 有日期的在前，日期升序 ''<1<2   1,2,''
      return promise;
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
      // 表单隐藏和显示的转换
      form.addEventListener('hide', () => {
        Dom.of(this.elements.createMission).removeClass('hide');
      });
      form.addEventListener('show', () => {
        // Dom.of(this.elements.createMission).addClass('hide');
      });
      // 默认隐藏表单
      form.methods.hide();
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
          state: e.detail.state,
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
          state: e.detail.state,
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
