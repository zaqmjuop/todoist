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

const ajax = {
  get: (url, callback) => {
    // ajax get
    if (typeof url !== 'string') throw new TypeError('路径错误');
    if (!(callback instanceof Function)) throw new TypeError('回调函数错误');
    const xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = (res) => {
      if (xmlhttp.readyState !== 4 || xmlhttp.status !== 200) return false;
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

  implant() {
    // 根据this.query嵌入页面
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    const parent = this.selector.parentElement;
    // 插入template
    this.template.setAttribute('query', this.query);
    parent.replaceChild(this.template, this.selector);
    if (this.style) {
      if (isScoped) {
        // 插入scoped style
        parent.insertBefore(this.style, parent.childNodes[0]);
      } else {
        // 插入global style
        this.style.setAttribute('component', this.query);
        const existStyle = document.querySelector(`style[component=${this.query}]`);
        if (existStyle) {
          document.querySelector('head').replaceChild(this.style, existStyle);
        } else {
          document.querySelector('head').appendChild(this.style);
        }
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
