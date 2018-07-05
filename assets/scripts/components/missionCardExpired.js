import missionListItemParam from './missionListItem';
import missions from '../indexeddb/missions';
import Component from './component';
import Dom from '../dom';

const now = new Date();


const param = {
  query: 'mission-card-expired',
  url: './assets/components/missionCardExpired.html',
  data() {
    return {

    };
  },
  selectors: {
    cardBody: '.card-body',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.loadDB();
      return this;
    },
    loadDB() {
      // 筛选过期任务
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
        sortByDate.forEach((data) => {
          // 添加 li item
          const listItem = Dom.of('<mission-list-item>').dom;
          Dom.of(this.elements.cardBody).append(listItem);
          const present = Object.assign(data, { formId: this.data.formId });
          const liParam = Object.assign({ present }, missionListItemParam);
          Component.pjaxCreate(liParam);
        });
      });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
