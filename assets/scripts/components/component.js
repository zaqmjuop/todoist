import Dom from '../dom';
import Utils from '../utils';
import promiseAjax from '../ajax';

class ComponentCollection extends Array {
  findById(query) {
    const format = String(query).match(/\d+/)[0];
    if (!format) { return undefined; }
    const id = Number(format);
    const result = this.find(item => item.componentId && (item.componentId === id));
    return result;
  }
}

// 保存所有创建的组件
// const components = new ComponentCollection();

let counter = 100001;
const takeId = () => {
  counter += 1;
  return counter;
};

class Component {
  // script来自js文件  template和style 来自html文件
  constructor(param) {
    // param.query是Dom.of参数
    // param.template是HtmlElement
    // param.style是<style>
    if (typeof param !== 'object') { throw new TypeError('param应该是一个object'); }
    if (!Utils.isElement(param.template)) { throw new TypeError('param.template应该是一个HtmlElement'); }
    const result = Object.assign(this, param);

    // 在页面插入的位置
    if (Utils.isString(this.query)) {
      Dom.of(this.template).attr('data-c-query', this.query);
    }
    const position = Dom.of(result.query).dom || Dom.of(`*[data-c-query=${result.query}]`).dom;
    if (!position) {
      throw new TypeError(`选择器 ${result.query} 未找到匹配项`);
    } else {
      result.query = position;
    }

    // 填充param.selectors 填充this.elements
    result.elements = {};
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

    // present
    result.present = result.present || {};

    // 确保param.data符合设定
    if (!(result.data instanceof Function)) throw new TypeError('缺少data属性或data不是Function类型');
    const data = result.data();
    result.data = Object.assign({}, data);
    if ((data instanceof Array) || (typeof data !== 'object')) {
      throw new TypeError('data应该返回一个Object');
    } else {
      const keys = Object.keys(result.data);
      const isHasFunc = keys.some((key) => {
        const isFunc = result.data[key] instanceof Function;
        return isFunc;
      });
      if (isHasFunc) { throw new TypeError('data返回的Object中不能含有Function'); }
    }
    // watch data
    // const insideData = Object.assign({}, data);
    if (result.watch instanceof Function) {
      const watchs = result.watch();
      if ((watchs instanceof Object) && (!(watchs instanceof Array))) {
        const watchKeys = Object.keys(watchs);
        const dataKeys = Object.keys(data);
        const keys = watchKeys.filter(key => dataKeys.includes(key));
        keys.forEach((key) => {
          Object.defineProperty(result.data, key, {
            enumerable: true,
            get: () => data[key],
            set: (val) => {
              data[key] = val;
              watchs[key]();
            },
          });
        });
      }
    }

    // 设置this.componentId属性
    result.setComponentId();

    // 绑定param.methods下的function的this指向
    const methods = Object.assign({}, result.methods);
    const methodNames = Object.keys(methods);
    methodNames.forEach((methodName) => {
      const method = methods[methodName];
      if (method && (typeof method === 'function')) {
        methods[methodName] = method.bind(result);
      }
    });
    result.methods = methods;

    result.components = new ComponentCollection();
    // this.lifeCycle();
    this.formatChildren().then(() => {
      const lifeCycle = this.lifeCycle();
      return lifeCycle;
    });
    Component.instances.push(result);
    return result;
  }
  ready() {
    if (this.components instanceof Array) {
      // 子组件
      
      // todo 改为异步先加载子组件再插入到document
    }
    return this;
  }
  formatChildren() {
    if (!this.children) { return new Promise(resolve => resolve(false)); }
    this.children = Object.assign({}, this.children);
    const elementsNames = Object.keys(this.elements);
    let promise = new Promise(resolve => resolve(1));
    const childrenNames = Object.keys(this.children);
    childrenNames.forEach((childName) => {
      const child = this.children[childName];
      promise = promise.then(() => {
        // todo 插入child
        // child = param || cpmponent
        const cpt = (child instanceof Component) ? child : this.appendComponent(child);
        return cpt;
      }).then((cpt) => {
        if (this.children[childName] !== cpt) {
          this.children[childName] = cpt;
        }
        const eleName = elementsNames.find(name => this.elements[name] === cpt.query);
        if (eleName) {
          this.elements[eleName] = cpt.template;
        }
      });
    });
    return promise;
  }
  lifeCycle() {
    // 生命周期
    if (Utils.isFunction(this.created)) {
      this.created();
    }
    this.implant();
    if (Utils.isFunction(this.implanted)) {
      this.implanted();
    }
  }

  refresh(present) {
    if (present) {
      this.present = present;
    }
    if (Utils.isFunction(this.created)) {
      this.created();
    }
    if (Utils.isFunction(this.implanted)) {
      this.implanted();
    }
  }

  static find(componentId) {
    // window.Component.find查找组件
    const findId = Number(componentId);
    const filter = components.filter((component) => {
      const id = Number(component.componentId);
      return id === findId;
    });
    return filter[0];
  }

  static destroy(query) {
    // 删除组件
    // query 是Component实例对象或componentId
    let cpt;
    if (query instanceof Component) {
      cpt = query;
    } else {
      cpt = Component.find(query);
    }
    if (cpt) {
      for (let index = 0; index < 3; index += 1) {
        const element = Dom.of(`*[data-c-id=c${cpt.componentId}]`);
        element.remove();
      }
    }
    // todo 子组件template不用删除
    if (cpt.children) {
      const names = Object.keys(cpt.children);
      names.forEach((name) => {
        const child = cpt.children[name];
        Component.destroy(child);
      });
    }
    if (cpt.components) {
      cpt.components.forEach((component) => {
        Component.destroy(component);
      });
    }
    return cpt;
  }

  addEventListener(typeArg, callback) {
    // 添加事件
    this.template.addEventListener(typeArg, callback);
  }

  dispatchEvent(typeArg, detail) {
    // 派发事件
    const event = new CustomEvent(typeArg, { detail });
    this.template.dispatchEvent(event);
  }

  setComponentId() {
    // 设置 data-component-id 属性
    this.componentId = String(takeId());
    this.template.setAttribute('data-c-id', `c${this.componentId}`);
    this.style.setAttribute('data-c-id', `c${this.componentId}`);
    const recursive = (element) => {
      if (!(element instanceof HTMLElement) || (element.childElementCount < 1)) { return false; }
      element.children.forEach((child) => {
        child.setAttribute('data-c-id', `c${this.componentId}`);
        recursive(child);
      });
      return element;
    };
    recursive(this.template);
    return this;
  }

  replaceGeneralScopedStyles(stylesContent) {
    // stylesContent是常规style 如 "div{} li{}"
    // 返回 "div[data-c-id=c${this.componentId}]{} li[data-c-id=c${this.componentId}]{}"
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
    // 返回 ...:hover ul[data-c-id=c${this.componentId}]> li
    const selectorsContents = style.replace(/\s*{.*$/, '').replace(/^\s*/, '').split(',');
    selectorsContents.forEach((singleSelectorsContent, selectorIndex) => {
      // singleSelectorsContent是单个结构完整的选择器 如： .klass:hover ul>li[name=x]:before
      const regSingleSelector = /[#\u002a\u002eA-Za-z][^\s+~>{]*/g; // 如  [".klass:hover", "ul>", "li[name=x]:before"]
      const repConent = singleSelectorsContent.replace(regSingleSelector, (selector) => {
        // selector是单个选择器如 .klass:hover 或 ul 或 li[name=x]:before
        const regNoPseudo = /([#\u002a\u002eA-Za-z][^:]*)/;
        const repSingleSelector = selector.replace(regNoPseudo, (selectorNoPseudo) => {
          // repSingleSelector是将选择器主体末尾，伪选择器前加上[data-c-id=c${this.componentId}]
          // 如从 li[name=x]:before => li[name=x][data-c-id=c${this.componentId}]:before
          const repNoPseudo = `${selectorNoPseudo}[data-c-id=c${this.componentId}]`;
          return repNoPseudo;
        });
        return repSingleSelector;
      });
      // 替换.klass:hover ul>li[name=x]:before 到.klass[data-c-id=c${this.componentId}]。。。
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
    // 处理scoped style 把每个选择器后都加上[data-c-id=c${this.componentId}]
    // unicode *#. \u002a\u0023\u002e
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    if (!isScoped) { return false; }
    const content = this.style.innerHTML;
    // 去掉换行
    const compressed = content.replace(/\n/g, '').replace(/\s+/g, ' ');
    const regStyleCompleteStructure = /(@keyframes|@media|[#\u002e\u002aA-Za-z])[^{}]*{([^{}]*{[^{}]*})*[^{}]*}/g;
    const styles = compressed.match(regStyleCompleteStructure);
    if (!styles) { return false; }
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
    Dom.of(this.query).replace(this.template);
    // 处理style
    if (this.style) {
      if (isScoped) {
        // 处理scoped style
        this.handleScopedStyle();
      }
      // 插入 style
      const existStyle = document.querySelector(`style[data-c-id=c${this.componentId}]`);
      if (existStyle) {
        document.querySelector('head').replaceChild(this.style, existStyle);
      } else {
        document.querySelector('head').appendChild(this.style);
      }
    }
    return this;
  }

  replaceElement(element) {
    // 替换到指定元素的位置
    if (!Dom.isElement(element)) {
      throw new TypeError(`${element}不是HTMLElement`);
    }
    Dom.of(element).replace(this.template);
    this.refresh();
  }

  static pjaxFormatHtml(url) {
    // promiseAjax请求html文件 返回一个对象{template, style} template是该html文件的<body>下第一个子元素 style是第一个<style>
    const promise = promiseAjax.get(url).then((result) => {
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
    // 通过参数param.url标示为html地址， 通过promiseAjax获取html并创建Component实例对象
    if (!Utils.isString(param.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
    const promise = Component.pjaxFormatHtml(param.url).then((format) => {
      const parameter = Object.assign(param, format);
      const cpt = Component.of(parameter);
      return cpt;
    });
    return promise;
  }

  insertComponent(param, refElement, relative) {
    // 添加子组件
    // refElement是参照物元素
    // relative是一个整数表示插入位置
    // relative若为1表示插入后是refElement的后一个元素 若为-1表示是refElement的前一个元素 若为0表示替换掉refElement
    if (!Dom.of(refElement).hasParent(this.template)) {
      throw new Error(refElement, '不是', this, '的子元素');
    }
    const relNum = Number(relative);
    if (!Number.isSafeInteger(relNum)) {
      throw new Error(`${relative}不是有效数字`);
    }
    const parent = refElement.parentElement;
    const refIndex = Array.from(parent.children).indexOf(refElement);
    // 插入的位置
    const query = Dom.of('<div>').dom;
    Dom.of(query).attr('data-c-id', `c${this.componentId}`);
    if (relNum === 0) {
      Dom.of(refElement).replace(query);
    } else if (relNum > 0) {
      const leftAdjacentIndex = -1 + refIndex + relNum;
      const leftAdjacent = parent.children[leftAdjacentIndex] || refElement;
      Dom.of(query).insertAfter(leftAdjacent);
    } else {
      const rightAdjacentIndex = 1 + refIndex + relNum;
      const rightAdjacent = parent.children[rightAdjacentIndex] || refElement;
      Dom.of(query).insertBefore(rightAdjacent);
    }
    let promise;
    if (param instanceof Component) {
      promise = new Promise((resolve) => {
        param.query = query;
        this.components.push(param);
        resolve(param);
      });
    } else {
      const parameter = Object.assign({}, param);
      promise = Component.pjaxFormatHtml(param.url).then(({ template, style }) => {
        parameter.template = template;
        parameter.style = style;
        parameter.query = query;
        const cpt = Component.of(parameter);
        // 将子组件保存在this.components中
        this.components.push(cpt);
        return cpt;
      });
    }
    return promise;
  }

  appendChildComponent(param, element) {
    // 在子元素下添加子组件
    if (!element.isSameNode(this.template) && !Dom.of(element).hasParent(this.template)) {
      throw new Error(`${element}不属于此组件`);
    }
    // 插入的位置
    const placeholder = Dom.of('<placeholder>');
    Dom.of(placeholder).attr('data-c-id', `c${this.componentId}`);
    Dom.of(element).append(placeholder);
    let promise;
    if (param instanceof Component) {
      promise = new Promise((resolve) => {
        param.query = placeholder;
        this.components.push(param);
        resolve(param);
      });
    } else {
      const parameter = Object.assign({}, param);
      promise = Component.pjaxFormatHtml(param.url).then(({ template, style }) => {
        parameter.template = template;
        parameter.style = style;
        parameter.query = placeholder;
        const cpt = Component.of(parameter);
        // 将子组件保存在this.components中
        this.components.push(cpt);
        return cpt;
      });
    }
    return promise;
  }

  appendComponent(param) {
    const parameter = Object.assign({}, param);
    // 通过参数param.url标示为html地址， 通过promiseAjax获取html并创建Component实例对象
    if (!Utils.isString(param.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
    const promise = Component.pjaxFormatHtml(param.url).then(({ template, style }) => {
      parameter.template = template;
      parameter.style = style;
      parameter.query = this.template.querySelector(parameter.query);
      const cpt = Component.of(parameter);
      // 将子组件保存在this.components中
      this.components.push(cpt);
      return cpt;
    });
    return promise;
  }

  replaceSelf(param) {
    // 将自己替换为另一个组件
    let promise;
    if (param instanceof Component) {
      promise = new Promise((resolve) => {
        Dom.of(this.template).replace(param.template);
        Dom.of(this.style).replace(param.style);
        param.refresh();
        resolve(param);
      });
    } else {
      if (!Utils.isString(param.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
      promise = Component.pjaxFormatHtml(param.url).then(({ template, style }) => {
        Dom.of(this.style).remove();
        const parameter = Object.assign(param, { template, style });
        parameter.query = this.template;
        const cpt = Component.of(parameter);
        return cpt;
      });
    }
    return promise;
  }

  // 显示全部实例化的组件
  static all() {
    return components;
  }
}

Component.instances = new ComponentCollection();

window.Component = Component;

export default Component;

// todo router 把没用的组件占用内存释放
