import missionCard from './missionCard';
import Component from './component';

const param = {
  query: 'mission-content',
  url: './assets/components/missionNextWeek.html',
  data() {
    return {};
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      const today = new Date();
      const todayPresent = { present: { date: today } };
      const cardTodayParam = Object.assign(todayPresent, missionCard);
      Component.pjaxCreate(cardTodayParam);
      this.data.inited = 1;
      return this;
    },
  },
  created() {
    console.log('week');
    this.methods.init();
  },
};

export default param;
