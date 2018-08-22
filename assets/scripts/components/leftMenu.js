import utils from '../utils';
import Dom from '../dom';

/** 页面左侧选项板 */

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
    bindEvents() {
      // 绑定current
      const lis = Dom.of(this.template).children('li');
      lis.forEach((li) => {
        Dom.of(li).on('click', () => {
          Dom.of('#current-li').attr('id', '');
          Dom.of(li).attr('id', 'current-li');
        });
      });
    },
  },
  created() {
    this.methods.bindEvents();
  },
};
export default param;
