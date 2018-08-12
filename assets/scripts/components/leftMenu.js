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
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    bindEvents() {
      const lis = Dom.of(this.template).children('li');
      lis.forEach((li) => {
        Dom.of(li).on('click', () => {
          Dom.of('#currentLink').attr('id', '');
          li.id = 'currentLink';
        });
      });
    },
  },
  created() {
    this.methods.init();
    this.methods.bindEvents();
  },
};
export default param;
