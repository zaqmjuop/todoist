import missionInboxParam from './inbox';
import missionTodayParam from './missionToday';
import missionNextWeekParam from './missionNextWeek';
import Dom from '../dom';

const router = {
  query: 'router',
  url: './assets/components/router.html',
  data() {
    return {
      counter: 1,
      href: window.location.href,
      current: this,
    };
  },
  route: {
    inbox: missionInboxParam,
    today: missionTodayParam,
    nextWeek: missionNextWeekParam,
  },
  methods: {
    // 不刷新页面改变path
    render(path, state) {
      const hash = String(path);
      const param = this.route[hash];
      if (!param) {
        throw new Error(`路径${path}对应Component不存在`);
      }
      const detail = (state instanceof Object) ? state : {};
      const present = param.present || {};
      param.present = Object.assign(present, detail);
      param.query = this.data.current.template;
      const promise = this.data.current.replaceSelf(param).then((cpt) => {
        this.data.current = cpt;
        const url = `${this.data.href}#${path}`;
        window.history.pushState(detail, 0, url);
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
    viewa() {
      this.methods.render('missionInboxParam');
    },
    viewb() {
      this.methods.render('missionTodayParam');
    },
    viewc() {
      this.methods.render('missionNextWeekParam');
    },
  },
  created() {
  },
};

export default router;

