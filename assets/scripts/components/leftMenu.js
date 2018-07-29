import utils from '../utils';
import Dom from '../dom';

const param = {
  query: 'left-menu',
  url: './assets/templates/leftMenu.html',
  name: 'leftMenu',
  data() {
    return {
      now: utils.now,
      inited: 0,
    };
  },
  selectors: {
    now: '.now',
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
        const now = new Date();
        const date = utils.formatDate(now);
        const time = utils.formatTime(now);
        const str = `${date} ${time}`;
        Dom.of(this.elements.now).attr('text', str);
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
