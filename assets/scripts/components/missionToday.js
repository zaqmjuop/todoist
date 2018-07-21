import missionCardExpired from './missionCardExpired';
import missionCard from './missionCard';

const card = Object.assign({ present: { date: new Date() } }, missionCard);

const param = {
  query: 'mission-content',
  url: './assets/components/missionToday.html',
  name: 'missionToday',
  data() {
    return {};
  },
  // components: [missionCardExpired],
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    loadChildren() {
      // 添加子组件
      const promise = new Promise(resolve => resolve(1))
        .then(() => {
          const result = this.appendChild(missionCardExpired, this.template, -1);
          return result;
        })
        .then(() => {
          const today = new Date();
          const present = { present: { date: today } };
          const todayParam = Object.assign(present, missionCard);
          const result = this.appendChild(todayParam, this.template, -1);
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
