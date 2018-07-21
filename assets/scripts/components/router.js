import missionInboxParam from './inbox';
import missionTodayParam from './missionToday';
import missionNextWeekParam from './missionNextWeek';
import Dom from '../dom';
import Component from './component';

const router = {
  query: 'router',
  url: './assets/components/router.html',
  name: 'router',
  data() {
    return {
      counter: 1,
      current: this,
      inited: 0,
    };
  },
  route: {
    missionInboxParam,
    missionTodayParam,
    missionNextWeekParam,
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.href = window.location.href;
      this.data.inited = 1;
      return this;
    },
    // 不刷新页面改变path
    render(path, state) {
      const route = this.route[String(path)];
      if (!route) { throw new Error(`路径${path}对应Component不存在`); }
      const param = Object.assign({}, route);
      const detail = ((state instanceof Object) && !(state instanceof Array)) ? state : {};
      const present = Object.assign({}, param.present, detail);
      param.present = present;
      const promise = this.data.current.replace(param).then((cpt) => {
        this.data.current = cpt;
        const url = `${this.data.href}#${path}`;
        window.history.pushState(detail, 0, url);
        return cpt;
      });
      return promise;
    },
    restore() {
      const isNeeded = Dom.of(this.data.current.template).hasParent(document.body);
      if (isNeeded) { return false; }
      Dom.of(this.data.current.template).replace(this.template);
      this.data.current = this.template;
      return this;
    },
  },
  created() {
    this.methods.init();
  },
};

export default router;

