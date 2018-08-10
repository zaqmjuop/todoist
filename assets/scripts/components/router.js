import welcome from './welcome';
import missionEdit from './missionEdit';
import Component from './component';
import quadrants from './quadrants';

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
      origin: window.location.href.match(/^[^#]+/)[0],
      href: window.location.href,
    };
  },
  route: {
    welcome,
    quadrants,
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    // 不刷新页面改变path
    // 参数path是this.route指定的组件，state会作为present传入
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
        const url = `${this.data.origin.replace(/\u002f$/, '')}/#/${path}/`;
        window.history.pushState(this.data.state, 0, url);
        this.data.href = window.location.href;
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
    window.router = this;
    this.methods.render('quadrants');
  },
};

export default router;

