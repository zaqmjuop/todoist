import missionCardExpired from './missionCardExpired';
import Component from './component';

const param = {
  query: 'mission-content',
  url: './assets/components/missionToday.html',
  data() {
    return {};
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      Component.pjaxCreate(missionCardExpired);
      return this;
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
