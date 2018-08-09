import Component from './component';
import Dom from '../dom';
import utils from '../utils';
import { Domain } from 'domain';

const param = {
  // 必需 name 组件的名称，可以用于查找组件
  name: 'alert',
  // 必需 query是目标替换元素,接受String或HTMLElement
  // 若query为String则最为querySelector参数
  query: 'alert',
  // 必需 url是模板文件路径
  url: './assets/templates/alert.html',
  // 必需 data 是组件的初始数据,若作为Object则共享一个对象，若作为Function return Object则不共享
  data() {
    return { counter: 1 };
  },
  selectors: {
    content: '.content',
    cancal: '.cancal',
  },
  methods: {
    render(content, klass) {
      // 返回一个HTMLElement实例的alert box
      // content是内容,klass一个字符串表示颜色，默认是蓝色,可选'success','error','warn','primary','gray'
      const clone = document.importNode(this.template, 1);
      clone.className = utils.isEffectiveString(klass) ? klass : '';
      Dom.of(clone).child('.content').innerText = String(content);
      this.methods.bindAlertEvents(clone);
      return clone;
    },
    bindAlertEvents(alert) {
      // bind cancal
      if (!utils.isElement(alert)) { throw new TypeError(`element不能是${alert}`); }
      Dom.of(alert).child('.cancal').onclick = () => alert.classList.add('hide');
    },
    alert(content, klass) {
      // 替代window.alert
      // content是内容,klass一个字符串表示颜色，默认是蓝色,可选'success','error','warn','primary','gray'
      const box = this.methods.render(content, klass);
      Dom.of('body').appendAccurate(box, 0);
      return box;
    },
  },
  created() {
    window.notice = this;
    this.methods.bindAlertEvents(this.template);
  },
};

export default param;
