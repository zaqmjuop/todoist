import Dom from '../dom';
import mission from '../model/mission';
import utils from '../utils';

const param = {
  query: 'mission-list-item',
  url: './assets/templates/missionListItem.html',
  name: 'missionListItem',
  selectors: {
    template: '.template',
    content: '.content',
    date: '.date',
    toggle: '.toggle',
  },
  data() {
    return {
      inited: 0,
    };
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.bindEvents();
      return this;
    },
    bindEvents() {
      // 切换任务状态
      const toggle = Dom.of(this.elements.toggle);
      toggle.on('click', () => {
        const toggleState = (toggle.dom.checked) ? 'done' : 'undone';
        const promise = mission.get(Number(this.data.item.primaryKey))
          .then((res) => {
            const data = res[0];
            data.state = toggleState;
            data.updatedAt = new Date();
            return mission.update(data);
          }).then(() => {
            this.data.item.state = toggleState.state;
            if (toggleState === 'done') {
              Dom.of(this.template).addClass('done');
            } else {
              Dom.of(this.template).removeClass('done');
            }
          });
        return promise;
      });
      // 更新按钮 点击content跳转到edit
      Dom.of(this.elements.content).on('click', () => {
        window.router.methods.render('welcome', { action: 'edit', primaryKey: this.data.item.primaryKey });
      });
    },
    fill() {
      if (!this.present.primaryKey) { throw new Error('missionListItem没有primaryKey'); }
      this.data.item = this.present;
      const dateStr = utils.formatDate(this.data.item.date);
      Dom.of(this.elements.content).attr('text', this.data.item.content);
      Dom.of(this.elements.date).attr('text', dateStr);
      const isExpired = this.data.item.date instanceof Date
        && utils.differDay(this.data.item.date, utils.now) > 0;
      if (isExpired) {
        Dom.of(this.elements.date).addClass('expired');
      }
      Dom.of(this.template).attr('data-primaryKey', this.data.item.primaryKey);
      if (this.data.item.state === 'done') {
        Dom.of(this.template).addClass('done');
        this.elements.toggle.checked = 1;
      } else {
        Dom.of(this.template).removeClass('done');
        this.elements.toggle.checked = 0;
      }
    },
  },
  created() {
    this.methods.init();
    this.methods.fill();
  },
};

export default param;
