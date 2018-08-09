import Component from './component';

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
  methods: {
    fill() {
      this.insertTo(document.body, 0);
    },
  },
  created() {
    window.alert2 = this;
    this.methods.fill();
  },
};

export default param;
