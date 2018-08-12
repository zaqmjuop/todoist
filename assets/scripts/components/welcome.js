import leftMenu from './leftMenu';
import missionCard from './missionCard';
import missionEdit from './missionEdit';
import quadrants from './quadrants';
import noteCard from './noteCard';
import noteEdit from './noteEdit';
import Dom from '../dom';
import Component from './component';

const left = Component.of(leftMenu);

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
    // 左侧选项栏
    this.appendChild(left, this.elements.left, 0);
    // 右侧子页面
    if (this.present.action === 'edit') {
      missionEdit.present = this.present;
      this.appendChild(missionEdit, this.elements.body, 0);
    } else if (this.present.action === 'quadrants') {
      quadrants.present = this.present;
      this.appendChild(quadrants, this.elements.body, 0);
    } else if (this.present.action === 'noteCard') {
      noteCard.present = this.present;
      this.appendChild(noteCard, this.elements.body, 0);
    } else if (this.present.action === 'noteEdit') {
      noteEdit.present = this.present;
      this.appendChild(noteEdit, this.elements.body, 0);
    } else {
      this.present.query = this.present.query || 'all';
      missionCard.present = this.present;
      this.appendChild(missionCard, this.elements.body, 0);
    }
    this.methods.init();
    this.methods.fill();
  },
};
export default param;
