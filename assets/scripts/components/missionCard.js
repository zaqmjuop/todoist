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
    cardHeader: '.card-header',
    cardBody: '.card-body',
    new: '*[name=new]',
    filter: '.filter',
    create: '.create',
    submit: '.submit',
    option: '.option',
    board: '.board',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      if (!this.present.query) {
        this.present.query = 'all';
      }
      this.data.date = this.present.date;
      this.data.days = this.present.days;
      this.data.urgent = this.present.query.urgent;
      this.data.important = this.present.query.important;
      this.data.boardSeen = !Dom.of(this.elements.board).hasClass('hide');
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
    submit() {
      // 快捷表单提交
      const content = Dom.of(this.elements.create).attr('value');
      if (!utils.isEffectiveString(content)) { return false; }
      const now = new Date();
      const data = {
        content,
        date: now,
        createdAt: now,
        urgent: this.data.urgent,
        important: this.data.important,
        state: 'undone',
      };
      const promise = mission.push(data)
        .then(primaryKey => mission.get(primaryKey))
        .then((res) => {
          Dom.of(this.elements.create).attr('value', '');
          this.methods.switching();
          // 添加li item
          const itemParam = Object.assign({ present: res[0] }, missionListItem);
          const append = this.appendChild(itemParam, this.elements.cardBody, 0);
          return append;
        });
      return promise;
    },
    switching() {
      // 提交按钮开关灯
      const content = Dom.of(this.elements.create).attr('value');
      const button = Dom.of(this.elements.submit);
      const heightLight = 'height-light';
      if (utils.isEffectiveString(content)) {
        button.addClass(heightLight);
      } else {
        button.removeClass(heightLight);
      }
    },
    bindEvents() {
      // 快捷表单
      // 提交按钮
      Dom.of(this.elements.submit).on('click', () => this.methods.submit());
      // 输入框若有内容submit高亮
      Dom.of(this.elements.create).on('input', () => this.methods.switching());
      // 输入框
      Dom.of(this.elements.create).on('keydown', (event) => {
        if (event.keyCode !== 13) { return false; }
        return this.methods.submit();
      });
      // 筛选
      const filter = Dom.of(this.elements.filter);
      filter.on('input', () => {
        const value = filter.attr('value');
        const items = this.where({ name: 'missionListItem' });
        items.forEach((item) => { item.methods.match(value); });
      });
      // 右上角选项板显示切换
      const option = Dom.of(this.elements.option);
      const toggleIcon = Dom.of(option).child('.icon');
      Dom.of(toggleIcon).on('click', () => {
        if (this.data.boardSeen) {
          Dom.of(this.elements.board).addClass('hide');
          this.data.boardSeen = false;
        } else {
          Dom.of(this.elements.board).removeClass('hide');
          this.data.boardSeen = true;
        }
      });
      // 右上角选项
      const boardDom = Dom.of(this.elements.board);
      // 默认排序
      const byDefatult = boardDom.child('*[data-sort=default]');
      Dom.of(byDefatult).on('click', () => this.methods.sortByDefatult());
      // 时间升序(没有时间的放最后)
      const byDate = boardDom.child('*[data-sort=date]');
      Dom.of(byDate).on('click', () => this.methods.sortByDate());
      // 按状态排序
      const byState = boardDom.child('*[data-sort=state]');
      Dom.of(byState).on('click', () => this.methods.sortByState());
      // 按重要程度排序
      const byImportant = boardDom.child('*[data-sort=important]');
      Dom.of(byImportant).on('click', () => this.methods.sortByImportant());
      // 按紧急程度排序
      const byUrgent = boardDom.child('*[data-sort=urgent]');
      Dom.of(byUrgent).on('click', () => this.methods.sortByUrgent());
    },
    /** 按默认排序 */
    sortByDefatult() {
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const datea = utils.isValidDate(a.data.item.date)
            ? a.data.item.date.getTime() : 9999999999999;
          const dateb = utils.isValidDate(b.data.item.date)
            ? b.data.item.date.getTime() : 9999999999999;
          return datea - dateb;
        });
        return items;
      });
      return sort;
    },
    /** 按时间排序 */
    sortByDate() {
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const datea = utils.isValidDate(a.data.item.date)
            ? a.data.item.date.getTime() : 9999999999999;
          const dateb = utils.isValidDate(b.data.item.date)
            ? b.data.item.date.getTime() : 9999999999999;
          return datea - dateb;
        });
        return items;
      });
      return sort;
    },
    /** 按状态排序 */
    sortByState() {
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const statea = (a.data.item.state === 'done') ? 1 : 0;
          const stateb = (b.data.item.state === 'done') ? 1 : 0;
          return statea - stateb;
        });
        return items;
      });
      return sort;
    },
    /** 按紧急程度排序 */
    sortByUrgent() {
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const urgenta = (a.data.item.urgent) ? 1 : 0;
          const urgentb = (b.data.item.urgent) ? 1 : 0;
          return urgentb - urgenta;
        });
        return items;
      });
      return sort;
    },
    /** 按重要程度排序 */
    sortByImportant() {
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const importanta = (a.data.item.important) ? 1 : 0;
          const importantb = (b.data.item.important) ? 1 : 0;
          return importantb - importanta;
        });
        return items;
      });
      return sort;
    },
    /** @param callback - 排序回调,第一个参数是一个数组，包含所有任务，应返回一个数组表示排序结果 */
    sortBy(callback) {
      const items = this.where({ name: 'missionListItem' });
      const sorted = callback(items);
      if (!(sorted instanceof Array)) { throw new Error('排序结果应是数组'); }
      sorted.forEach((item) => {
        Dom.of(this.elements.cardBody).append(item.template);
      });
      return sorted;
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
