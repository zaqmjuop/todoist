import missionCard from './missionCard';
import Component from './component';

const now = new Date();

const param = {
  query: 'mission-content',
  url: './assets/components/missionNextWeek.html',
  data() {
    return {};
  },
  selectors: {
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.methods.loadNextWeek();
      this.data.inited = 1;
      return this;
    },
    loadNextWeek() {
      // 添加下周7天
      let promise = new Promise(resolve => resolve(1));
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();
      const nextWeek = [0, 1, 2, 3, 4, 5, 6].map((item, index) => {
        const date = new Date(nowYear, nowMonth, (now.getDate() + index));
        return date;
      });
      const weekParam = nextWeek.map((day) => {
        const present = { present: { date: day } };
        const dayParam = Object.assign(present, missionCard);
        return dayParam;
      });
      weekParam.forEach((dayParam) => {
        promise = promise.then(() => {
          const result = this.appendChildComponent(dayParam, this.template);
          return result;
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
