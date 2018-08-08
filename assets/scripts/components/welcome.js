import leftMenu from './leftMenu';
import missionCard from './missionCard';
import missionEdit from './missionEdit';
import Dom from '../dom';

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
  selectors: {
    title: '.title',
    left: '.left',
    body: '.body',
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
    fill() {
      let title;
      if (this.present.query) {
        title = text[this.present.query] || String(this.present.query);
      } else if (this.present.action) {
        title = `${this.present.action}: ${this.present.primaryKey}`;
      }
      Dom.of(this.elements.title).attr('text', title);
    },
  },
  created() {
    console.log(this.present)
    if (this.present.action === 'edit') {
      missionEdit.present = this.present;
      this.appendChild(missionEdit, this.elements.body, 0);
    } else {
      missionCard.present = this.present;
      this.appendChild(missionCard, this.elements.body, 0);
    }
    this.methods.init();
    this.methods.fill();
  },
  components: [leftMenu],
};
export default param;
