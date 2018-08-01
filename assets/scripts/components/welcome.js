import leftMenu from './leftMenu';
import missionCard from './missionCard';
import Dom from '../dom';

// const defaultQuery = {
//   all: getAll,
//   expired: getExpired,
//   done: getDone,
//   undone: getUndone,
// };
const text = {
  all: '所有任务',
  expired: '已过期',
  done: '已完成',
  undone: '未完成',
};

const param = {
  query: 'mission-content',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  // present 是增量传递
  present: {
    text,
  },
  selectors: {
    title: '.title',
    left: '.left',
  },
  data() {
    return {};
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
  },
  created() {
    const title = text[this.present.query] || String(this.present.query);
    Dom.of(this.elements.title).attr('text', title);
    this.methods.init();
  },
  components: [leftMenu, missionCard],
};
export default param;
