import missionCardExpired from './missionCardExpired';
import missionCard from './missionCard';


const param = {
  query: 'mission-content',
  url: './assets/components/missionToday.html',
  name: 'missionToday',
  data() {
    return {};
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    loadChildren() {
      // 添加子组件
      const promise = new Promise(resolve => resolve(1)).then(() => {
        const expired = Object.assign({}, missionCardExpired);
        const result = this.appendChildComponent(expired, this.template);
        return result;
      }).then(() => {
        const today = new Date();
        const present = { present: { date: today } };
        const todayParam = Object.assign(present, missionCard);
        const result = this.appendChildComponent(todayParam, this.template);
        return result;
      });
      return promise;
    },
  },
  created() {
    this.methods.init();
    this.methods.loadChildren();
  },
};
export default param;
