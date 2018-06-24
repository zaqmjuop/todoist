// 创建component的两种方式
// 参数
// const param = {
//   query: 'component2',
//   url: './assets/components/c2.html',
//   created: () => {
//     console.log('created', param.template);
//   },
// };
// 方式一 先pjax在同步
// Component.pjaxFormatHtml(param.url).then((format) => {
//   const parameter = Object.assign(param, format);
//   const cpt = Component.of(parameter);
//   return cpt;
// });
// 方式二 直接异步
// Component.pjaxCreate(param);

import Utils from '../utils';

let counter = 100001;
const takeId = () => {
  counter += 1;
  return counter;
};

const ajax = {
  get: (url, callback) => {
    // ajax get
    if (typeof url !== 'string') { throw new TypeError('路径错误'); }
    if (!(callback instanceof Function)) { throw new TypeError('回调函数错误'); }
    const xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = (res) => {
      if (xmlhttp.readyState !== 4 || xmlhttp.status !== 200) { return false; }
      return callback(res);
    };
  },
};

const pjax = {
  get: (url) => {
    // promise ajax get
    if (!Utils.isString(url)) { throw new TypeError('参数url是路径 字符串类型'); }
    const promise = new Promise((resolve) => {
      ajax.get(url, (result) => {
        resolve(result.target.response);
      });
    });
    return promise;
  },
};

class Component {
  // script来自js文件  template和style 来自html文件
  constructor(param) {
    // param.query是document.querySelector参数
    // param.template是HtmlElement
    // param.style是<style>
    if (typeof param !== 'object') { throw new TypeError('param应该是一个object'); }
    if (!Utils.isString(param.query)) { throw new TypeError('param.query应该是字符串类型querySelector参数'); }
    if (!Utils.isElement(param.template)) { throw new TypeError('param.template应该是一个HtmlElement'); }
    const result = Object.assign(this, param);
    this.selector = document.querySelector(this.query) || document.querySelector(`*[query=${this.query}]`);
    if (!Utils.isElement(this.selector)) { throw new TypeError(`选择器 ${param.query} 未找到匹配项`); }
    result.setComponentId();
    if (result.selectors && (typeof result.selectors === 'object')) {
      // 接受{}类型的属性param.selectors 遍历param.selectors的键，取每个键的值作为querySelector参数，
      // 然后找到对应的HTMLElement集合并设置在this.elements属性中
      // 例如存在param.selectors.foo = '.foo' 则得到this.elements.foo = querySelector('.foo')
      const selectorNames = Object.keys(result.selectors);
      const elements = {};
      selectorNames.forEach((name) => {
        const selector = result.selectors[name];
        if (selector && Utils.isString(selector)) {
          const element = result.template.querySelector(selector);
          if (Utils.isElement(element)) {
            elements[name] = element;
          }
        }
      });
      if (Object.keys(elements).length > 0) {
        elements.template = result.template;
        result.elements = elements;
      }
    }
    if (result.methods && (typeof result.methods === 'object')) {
      // 绑定param.methods下的function的this指向
      const methodNames = Object.keys(result.methods);
      methodNames.forEach((methodName) => {
        const method = result.methods[methodName];
        if (method && (typeof method === 'function')) {
          result.methods[methodName] = method.bind(result);
        }
      });
    }
    try {
      // 生命周期
      if (Utils.isFunction(result.created)) {
        result.created();
      }
      result.implant();
      if (Utils.isFunction(result.implanted)) {
        result.implanted();
      }
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  setComponentId() {
    // 设置 data-component-id 属性
    this.dataId = String(takeId());
    this.template.setAttribute('data-c-id', `c${this.dataId}`);
    this.style.setAttribute('data-c-id', `c${this.dataId}`);
    const recursive = (element) => {
      if (!(element instanceof HTMLElement) || (element.childElementCount < 1)) { return false; }
      element.children.forEach((child) => {
        child.setAttribute('data-c-id', `c${this.dataId}`);
        recursive(child);
      });
      return element;
    };
    recursive(this.template);
    return this;
  }

  replaceGeneralScopedStyles(stylesContent) {
    // stylesContent是常规style 如 "div{} li{}"
    // 返回 "div[data-c-id=c${this.dataId}]{} li[data-c-id=c${this.dataId}]{}"
    const regGeneralStyleCompleteStructure = /[#\u002e\u002aA-Za-z][^{}]*{([^{}]*{[^{}]*})*[^{}]*}/g;
    const styles = stylesContent.match(regGeneralStyleCompleteStructure);
    styles.forEach((styleContent, styleIndex) => {
      const rep = this.replaceGeneralScopedStyle(styleContent);
      styles[styleIndex] = rep;
    });
    const result = styles.join(' ');
    return result;
  }

  replaceGeneralScopedStyle(style) {
    // 是单个结构完整的style 如： .klass: hover ul > li[name = x]: before{}
    // 返回 ...:hover ul[data-c-id=c${this.dataId}]> li[name = x][data-c-id=c${this.dataId}]: before{}
    const selectorsContents = style.replace(/\s*{.*$/, '').replace(/^\s*/, '').split(',');
    selectorsContents.forEach((singleSelectorsContent, selectorIndex) => {
      // singleSelectorsContent是单个结构完整的选择器 如： .klass:hover ul>li[name=x]:before
      const regSelector = /(\u002a|[#\u002eA-Za-z][^\s+~:>{]*)([\s+~>{]|:\S+)*/g; // 如  [".klass:hover", "ul>", "li[name=x]:before"]
      const repConent = singleSelectorsContent.replace(regSelector, (match, p1, p2) => {
        // 替换为 .klass[data-c-id=c${this.dataId}]:hover ul[data-c-id=c${this.dataId}]
        const rep = `${p1}[data-c-id=c${this.dataId}]${p2 || ''}`;
        return rep;
      });
      // 替换.klass:hover ul>li[name=x]:before 到.klass[data-c-id=c${this.dataId}]。。。
      selectorsContents[selectorIndex] = repConent;
    });
    const repselectorsContents = selectorsContents.join(',');
    const result = style.replace(/^[^{}]*{/, () => {
      const rep = `${repselectorsContents} {`;
      return rep;
    });
    return result;
  }

  handleScopedStyle() {
    // 处理scoped style 把每个选择器后都加上[data-c-id=c${this.dataId}]
    // unicode *#. \u002a\u0023\u002e
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    if (!isScoped) {
      return false;
    }
    const content = this.style.innerHTML;
    // 去掉换行
    const compressed = content.replace(/\n/g, '').replace(/\s+/g, ' ');
    const regStyleCompleteStructure = /(@keyframes|@media|[#\u002e\u002aA-Za-z])[^{}]*{([^{}]*{[^{}]*})*[^{}]*}/g;
    const styles = compressed.match(regStyleCompleteStructure);
    styles.forEach((singleStyle, styleIndex) => {
      let repConent;
      // singleStyle是单条结构完整的style 如: selector {}
      if (singleStyle.match('@keyframes')) {
        // css 动画 如：@keyframes myfirst{ from { background: red; }to { background: yellow; }}
        repConent = singleStyle;
      } else if (singleStyle.match('@media')) {
        // 媒体查询 如：@media screen and (max-width: 300px) { body {background-color:lightblue; }}
        const styleContents = singleStyle.replace(/^[^@]*@media[^{]*{/, '').replace(/}[^}]*$/, '');
        // styleContents是style主体 body {background-color:lightblue; }
        repConent = this.replaceGeneralScopedStyles(styleContents);
      } else {
        // 常规单条style 如#id{} 或.class{} 或div{} 或div::before{} 或div:hover::before{}
        repConent = this.replaceGeneralScopedStyle(singleStyle);
      }
      styles[styleIndex] = repConent;
    });
    const resultStyleHTML = styles.join(' ');
    this.style.innerHTML = resultStyleHTML;
    return this;
  }

  implant() {
    // 根据this.query嵌入页面
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    const parent = this.selector.parentElement;
    // 插入template
    this.template.setAttribute('query', this.query);
    parent.replaceChild(this.template, this.selector);
    if (this.style) {
      if (isScoped) {
        // 处理scoped style
        this.handleScopedStyle();
      }
      // 插入 style
      const existStyle = document.querySelector(`style[data-c-id=c${this.dataId}]`);
      if (existStyle) {
        document.querySelector('head').replaceChild(this.style, existStyle);
      } else {
        document.querySelector('head').appendChild(this.style);
      }
    }
    return this;
  }

  static pjaxFormatHtml(url) {
    // pjax请求html文件 返回一个对象{template, style} template是该html文件的<body>下第一个子元素 style是第一个<style>
    const promise = pjax.get(url).then((result) => {
      const html = document.createElement('html');
      html.innerHTML = result;
      const styles = html.querySelectorAll('style');
      const body = html.querySelector('body');
      if (styles.length > 1) { throw new TypeError('至多可以有一个<style>元素'); }
      if (body.childElementCount !== 1) { throw new TypeError('<body>内应有且只有一个根元素'); }
      const template = body.firstElementChild;
      const style = styles[0];
      return { template, style };
    });
    return promise;
  }

  static of(param) {
    return new Component(param);
  }

  static pjaxCreate(param) {
    // 通过参数param.url标示为html地址， 通过pjax获取html并创建Component实例对象
    if (!Utils.isString(param.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
    const promise = Component.pjaxFormatHtml(param.url).then((format) => {
      const parameter = Object.assign(param, format);
      const cpt = Component.of(parameter);
      return cpt;
    });
    return promise;
  }
}


export default Component;
