import missionInboxParam from './inbox';
import missionTodayParam from './missionToday';
import missionNextWeekParam from './missionNextWeek';
import Component from './component';

const router = {
  query: 'router',
  url: './assets/templates/router.html',
  name: 'router',
  data() {
    return {
      counter: 1,
      current: this,
      inited: 0,
      path: '',
      state: {},
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
      this.data.path = path;
      this.data.state = Object.assign({}, state);
      const param = Object.assign({}, route);
      const present = Object.assign({}, param.present, this.data.state);
      param.present = present;
      const current = this.data.current;
      const promise = current.replace(param).then((cpt) => {
        if (current !== this) { Component.removeComponent(current); }
        this.data.current = cpt;
        const url = `${this.data.href}#${path}/`;
        window.history.pushState(this.data.state, 0, url);
        return cpt;
      });
      return promise;
    },
    restore() {
      if (!this.data.path) { return false; }
      const promise = this.methods.render(this.data.path, this.data.state);
      return promise;
    },
  },
  created() {
    this.methods.init();
  },
};

export default router;

