import Dom from '../dom';
import mission from '../model';
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
    createMission: '.create-mission',
    cardBody: '.card-body',
    create: '*[name=create]',
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
        const notice = window.notice.methods.render('没有任务');
        Dom.of(this.template).appendAccurate(notice, 0);
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
      const append = this.appendChild(itemParam, this.elements.cardBody, -1);
      return append;
    },
    bindEvents() {
      // 进入新建item界面
      Dom.of(this.elements.create).on('click', () => {
        window.router.methods.render('welcome', { action: 'edit' });
      });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
