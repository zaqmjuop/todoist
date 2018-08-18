import Dom from '../dom';
import mission from '../model/mission';
import missionListItem from './missionListItem';
import utils from '../utils';

/** 任务列表组件 */

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
        .then(() => this.methods.sort())
        .then(() => this.methods.initItems());
      this.data.inited = 1;
      return promise;
    },
    initItems() {
      let promise = Promise.resolve(1);
      // 添加 li item
      this.data.items.forEach((item) => {
        promise = promise.then(() => this.methods.appendItem(item));
      });
      return promise;
    },
    sort() {
      // 排序，按完成状态分成2组，每组按时间排序，然后合并
      const dones = [];
      const undones = [];
      this.data.items.forEach((item) => {
        if (item.state === 'done') {
          dones.push(item);
        } else {
          undones.push(item);
        }
      });
      const sortByDate = (items) => {
        items.sort((a, b) => {
          const datea = (utils.isValidDate(a.date)) ? a.date.getTime() : 0;
          const dateb = (utils.isValidDate(b.date)) ? b.date.getTime() : 0;
          return (datea - dateb);
        });
        return items;
      };
      sortByDate(dones);
      sortByDate(undones);
      const sorted = undones.concat(dones);
      this.data.items = sorted;
      return sorted;
    },
    loadDB() {
      const filter = mission.methods.getQuery(this.present.query)
        .then((res) => { this.data.items = res; });
      return filter;
    },
    appendItem(detail) {
      // 添加li item
      const itemParam = Object.assign({ present: detail }, missionListItem);
      const append = this.appendChild(itemParam, this.elements.cardBody, -1);
      return append;
    },
    bindEvents() {
      // 筛选
      const filter = Dom.of(this.elements.filter);
      filter.on('input', () => {
        const value = filter.attr('value');
        const items = this.where({ name: 'missionListItem' });
        items.forEach((item) => { item.methods.match(value); });
      });
      // 新建任务
      Dom.of(this.elements.create).on('click', () => {
        const detail = { action: 'edit' };
        if (this.present && this.present.query) {
          detail.urgent = this.present.query.urgent;
          detail.important = this.present.query.important;
        }
        window.router.methods.render('welcome', detail);
      });
    },
  },
  created() {
    console.log('card', this.present)
    this.methods.init();
  },
};

export default param;
