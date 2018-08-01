import utils from '../utils';
import Dom from '../dom';

const param = {
  query: 'left-menu',
  url: './assets/templates/leftMenu.html',
  name: 'leftMenu',
  data() {
    return {
      date: utils.now,
    };
  },
  passon: [],
  selectors: {
    date: '.date',
    time: '.time',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.methods.fillTime();
      this.data.inited = 1;
      return this;
    },
    fillTime() {
      const fill = () => {
        // 左侧时间板
        const now = new Date();
        const date = utils.formatDate(now);
        const time = utils.formatTime(now);
        if (this.data.dateStr !== date) {
          this.data.dateStr = date;
          Dom.of(this.elements.date).attr('text', date);
        }
        Dom.of(this.elements.time).attr('text', time);
        this.data.fillTimeOut = window.setTimeout(fill, 1000);
      };
      fill();
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
