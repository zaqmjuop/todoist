import Dom from '../dom';
import mission from '../model/mission';
import missionListItem from './missionListItem';
import utils from '../utils';

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
    cardBody: '.card-body',
    create: '*[name=create]',
    filter: '.filter',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.date = this.present.date;
      this.data.days = this.present.days;
      if (!this.present.query) {
        this.present.query = 'all';
      }
      const promise = utils.newPromise()
        .then(() => this.methods.bindEvents())
        .then(() => this.methods.loadDB())
        .then(() => this.methods.initItems());
      this.data.inited = 1;
      return promise;
    },
    initItems() {
      let promise = utils.newPromise();
      if (!this.data.items || this.data.items.length < 1) {
        window.notice.methods.noticeIn(this.template, '没有任务', 'warn');
      }
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
          const deep = byDate.map((states) => {
            const sortByDate = states[0].sort((a, b) => (a.date >= b.date));
            return [sortByDate, states[1]];
          });
          const flat = utils.flat(deep, 2);
          this.data.items = flat;
          return this.data.items;
        });
      return promise;
    },
    appendItem(detail) {
      // 添加li item
      const present = Object.assign(detail);
      present.formId = this.data.formId;
      const itemParam = Object.assign({ present }, missionListItem);
      const append = this.appendChild(itemParam, this.elements.cardBody, -1);
      return append;
    },
    bindEvents() {
      // 筛选
      const filter = Dom.of(this.elements.filter);
      filter.on('input', () => {
        const value = filter.attr('value');
        const items = this.where({ name: 'missionListItem' });
        items.forEach((item) => {
          let isMatch = false;
          try {
            isMatch = !!item.data.content.match(value);
          } catch (err) {
            isMatch = false;
          }
          if (isMatch) {
            Dom.of(item.template).removeClass('hide');
          } else {
            Dom.of(item.template).addClass('hide');
          }
        });
      });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
