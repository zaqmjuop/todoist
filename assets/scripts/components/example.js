import Component from './component';

const param = {
  data() {
    // data返回一个Object作为this.data 这样使每个实例化的组件都是独立不共享的this.data
    return {
      counter: 1,
    };
  },
  // query是组件在页面中插入的位置
  // query: 'example-position' 这将替换页面中的<example-position></example-position>为此组件
  query: 'example-position',
  // url是html模板文件位置 以执行页面为准的相对路径
  // html模板中的<body>下第一个元素将保存在this.template
  // html模板中的<style>将保存在this.style
  url: './assets/templates/example.html',
  // selectors是选择器，用来选择html模板中的元素
  // this.template是url位置的html模板<body>下第一个元素
  // example: '.example' 将选中html模板中的第一个带有class="example"的元素,
  // 相当于this.template.querySelector('.example')
  // 保存在this.elements.example
  selectors: {
    example: '.example',
  },
  // present不会变化 仅当此组件作为子组件时传送数据用
  present: {
  },
  // methods是方法的集合
  methods: {
    init() {
      if (!this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    find() {
      // 实例化之后当前组件将会被分配一个数字类型的id属性 且this.template会添加属性 data-c-id=`c${thid.id}`
      // Component.find(this.id)可以获取当前组件
      const result = Component.find(this.id);
      return result;
    },
    event() {
      // 当需要向外部传递数据时
      // 在外部引用这个组件并监听事件 然后在此组件内派发事件
      // 仅做传递数据用
      // 监听事件 数据保存在event.detail中
      // this.addEventListener('customEventName', e => e.detail）
      // 触发事件
      // dispatchEvent('customEventName', detail)
    },
  },
  // created在实例化之后，插入到页面之前执行
  created() {
    this.methods.init();
  },
  // implanted在插入到页面之后执行
  implanted() {
    console.log(this);
  },
};

// 创建component的两种方式
// 方式一 ajax异步获取html模板然后插入到页面指定位置
// Component.pjaxCreate(param).then((cpt)=>{
//   console.log(cpt)
// });
// 方式二 先Component.pjaxFormatHtml通过ajax获取html模板文件
//       Component.of是同步方法 但需要参数具有template和style属性
// Component.pjaxFormatHtml(param.url).then(({template, style}) => {
//   const parameter = Object.assign(param, {template, style});
//   const cpt = Component.of(parameter);
//   return cpt;
// });

export default param;
