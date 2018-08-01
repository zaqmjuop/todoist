import Dom from '../dom';
import Utils from '../utils';
import promiseAjax from '../ajax';

// 保存所有创建的组件
const components = new Set();

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
            Dom.of(element).attr('data-c-selector', name);
            elements[name] = element;
          }
        }
      });
      if (Object.keys(elements).length > 0) {
        elements.template = result.template;
        result.elements = elements;
      }
    }

    // parent
    let parent = result.parent;
    Object.defineProperty(result, 'parent', {
      enumerable: true,
      configurable: true,
      get: () => {
        return parent;
      },
      set: (cpt) => {
        if (cpt === parent) { return parent; }
        if (cpt !== undefined && cpt !== null && !Component.isComponent(cpt)) {
          throw new TypeError(`父组件不可以为${cpt}`);
        }
        if (Component.isComponent(parent)) {
          parent.components.delete(result);
        }
        if (cpt) {
          parent = cpt;
          parent.components.add(result);
        } else {
          parent = null;
        }
        return parent;
      },
    });
    result.parent = parent;

    // 子组件components
    let componentsSet;
    if (!result.components) {
      componentsSet = new Set();
    } else if ((result.components instanceof Array) || (result.components instanceof Set)) {
      componentsSet = new Set([...result.components]);
    } else {
      throw new TypeError(`${param.components}不能作为子组件集`);
    }
    result.components = componentsSet;

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

    // 索引和标识
    if (!result.name) {
      const name = result.url.match(/([^/]+)\.html/)[1];
      result.name = name;
    }

    // 设置this.componentId属性
    result.setComponentId();

    // 绑定param.methods下的function的this指向
    if (result.methods) {
      const methods = {};
      const methodNames = Object.keys(result.methods);
      methodNames.forEach((methodName) => {
        const method = result.methods[methodName];
        if (typeof method === 'function') {
          methods[methodName] = method.bind(result);
        }
      });
      result.methods = methods;
    }

    this.formatChildren()
      .then(() => this.lifeCycle());

    components.add(result);
    return result;
  }
  formatChildren() {
    // 处理子组件components中不是组件实例化对象的对象
    let promise = new Promise(resolve => resolve(1));
    const params = Array.from(this.components).filter(item => !(item instanceof Component));
    params.forEach((item) => {
      const param = Object.assign({}, item);
      // 传递present child.passon = [] 若是空数组则parsent全部传递，否则查找键名传递
      if (param.passon instanceof Array) {
        let passPresent = {};
        if (param.passon.length === 0) {
          passPresent = this.present;
        } else {
          const presentKeys = Object.keys(this.present);
          const passKeys = param.passon.filter(key => ((typeof key === 'string') && presentKeys.includes(key)));
          passKeys.forEach((key) => {
            passPresent[key] = this.present[key];
          });
        }
        param.present = passPresent;
      }
      // 传递present
      promise = promise.then(() => {
        // 取消router添加的 '/#/'
        const originReg = /^[^#]+/;
        const origin = window.location.href.match(originReg)[0];
        const rel = param.url.replace(/^\u002e\u002f/, '');
        const url = `${origin}${rel}`;
        const ajax = Component.pjaxFormatHtml(url);
        return ajax;
      }).then(({ template, style }) => {
        const query = this.template.querySelector(param.query);
        if (!Dom.isElement(query)) { throw new Error(`子组件插入位置未找到${item.query}`); }
        param.query = query;
        param.template = template;
        param.style = style;
        param.parent = this;
        const cpt = Component.of(param);
        const selector = Dom.of(query).attr('data-c-selector');
        if (selector) {
          this.elements[selector] = cpt.template;
        }
        this.components.delete(item);
        this.components.add(cpt);
        return cpt;
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

  static findBy(query, cpt) {
    // 查找单个组件
    // query是对象类型表示查找选项，可选componentId和name,例如{componentId: 123, name: 'name'}
    // cpt 是组件实例化的对象，如果存在该参数，则从cpt.components查找，否则从Component.components查找
    const keys = Object.keys(query);
    const keyName = keys.find(key => (key === 'name'));
    const keyId = keys.find(key => (key === 'componentId'));
    if (!keyName && !keyId) { throw new Error(`查询参数无效${JSON.stringify(query)}`); }
    if (arguments.length > 1 && !(cpt instanceof Component)) { throw new TypeError(`不是有效组件${JSON.stringify(cpt)}`); }
    if (keyId && !Number.isSafeInteger(query.componentId)) { throw new TypeError(`不是有效组件componentId ${query.componentId}`); }
    let result = null;
    const set = (arguments.length > 1) ? cpt.components : components;
    const cpts = Array.from(set);
    for (let index = 0; index < cpts.length; index += 1) {
      const item = cpts[index];
      const matchName = !(keyName) || (query.name === item.name);
      const matchCId = !(keyId) || (Number(query.componentId) === Number(item.componentId));
      const isMatch = matchName && matchCId;
      if (isMatch) {
        result = item;
        break;
      }
    }
    return result;
  }

  findBy(query) {
    // 查找单个组件
    // query是对象类型表示查找选项，可选componentId和name,例如{componentId: 123, name: 'name'}
    return Component.findBy(query, this);
  }

  static where(query, cpt) {
    // 查找多个组件
    // query是对象类型表示查找选项，可选componentId和name,例如{componentId: 123, name: 'name'}
    // cpt 是组件实例化的对象，如果存在该参数，则从cpt.components查找，否则从Component.components查找
    if (!query.name && !query.componentId) { throw new Error(`查询参数无效${JSON.stringify(query)}`); }
    if (arguments.length > 1 && !(cpt instanceof Component)) { throw new TypeError(`不是有效组件${JSON.stringify(cpt)}`); }
    const set = (arguments.length > 1) ? cpt.components : components;
    const cpts = Array.from(set);
    const filter = cpts.filter((item) => {
      const matchName = !(query.name) || query.name === item.name;
      const matchCId = !(query.componentId) || query.componentId === item.componentId;
      const isMatch = matchName && matchCId;
      return isMatch;
    });
    return filter;
  }

  where(query) {
    // 查找多个组件
    // query是对象类型表示查找选项，可选componentId和name,例如{componentId: 123, name: 'name'}
    return Component.where(query, this);
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
    // 去掉注释
    const commentReg = /\u002f\u002a(\u002f\u002a|[^\u002a])*\u002a\u002f/g;
    const removeComments = this.style.innerHTML.replace(commentReg, '');
    const content = removeComments;
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
        const mediaHeadReg = /^[^@]*@media[^{]*{/;
        const mediaHead = singleStyle.match(mediaHeadReg)[0];
        const styleContents = singleStyle.replace(mediaHead, '').replace(/}[^}]*$/, '');
        // styleContents是style主体 body {background-color:lightblue; }
        const replacedContents = this.replaceGeneralScopedStyles(styleContents);
        const mediaContent = `${mediaHead} ${replacedContents} }`;
        repConent = mediaContent;
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

  static pjaxFormatHtml(url) {
    // promiseAjax请求html文件 返回一个对象{template, style} template是该html文件的<body>下第一个子元素 style是第一个<style>
    if (!url || (typeof url !== 'string')) {
      throw new TypeError(`${url}不是有效的html文件地址`);
    }
    const promise = promiseAjax.get(url).then((result) => {
      const html = document.createElement('html');
      html.innerHTML = result;
      const styles = html.querySelectorAll('style');
      const body = html.querySelector('body');
      if (styles.length > 1) { throw new TypeError('至多可以有一个<style>元素'); }
      if (body.childElementCount !== 1) { throw new TypeError('<body>内应有且只有一个根元素'); }
      const template = body.firstElementChild;
      const style = styles[0] || document.createElement('style');
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

  // 显示全部实例化的组件
  static all() {
    return components;
  }

  static isComponent(component) {
    // 判断是否是一个组件实例化对象
    return component && (component instanceof Component);
  }

  appendChild(want, element, position) {
    // 添加一个子组件
    // want是组件参数或组件实例化对象
    // element应是this.template或其子HTMLElement元素
    // position是位置 -1表示成为最后一个子元素，0表示成为第一个子元素，1表示成为第二个子元素
    // 当position<0或大于指定元素的子元素数时，插入为最后一个元素
    // 返回值promise resolve(want)
    return Component.appendComponent(want, this, element, position);
  }
  replaceChild(want, exist) {
    // 替换子元素
    // want是组件参数或组件实例化对象
    // exist是已存在子元素
    // 返回值promise resolve(want)
    const promise = Component.replaceComponent(want, exist).then((cpt) => {
      cpt.parent = this;
      return cpt;
    });
    return promise;
  }
  removeChild(exist) {
    // 移除子组件
    // 返回值promise resolve(exist)
    if (!this.components.has(exist)) {
      throw new TypeError(`不是子组件${JSON.stringify(exist)}`);
    }
    return Component.removeComponent(exist);
  }

  replace(want) {
    // 将自己替换为另一个组件参数或实例化的组件
    // 返回值promise resolve(want)
    return Component.replaceComponent(want, this);
  }

  static appendComponent(want, exist, element, position) {
    // 添加一个组件
    // want是组件参数或组件实例化对象
    // exist是父组件
    // element应是exist上的一个HTMLElement元素
    // position是位置 -1表示成为最后一个子元素，0表示成为第一个子元素，1表示成为第二个子元素
    // 当position<0或大于指定元素的子元素数时，插入为最后一个元素
    // 返回值promise resolve(want)
    if (!Component.isComponent(exist)) {
      throw new TypeError(`${exist}不是组件`);
    }
    const validElement = Dom.isElement(element) &&
      (exist.template.isSameNode(element) || Dom.of(element).hasParent(exist.template));
    if (!validElement) {
      throw new TypeError(`${element}不是组件id:${exist.componentId}的子元素`);
    }
    if (!Number.isSafeInteger(position)) {
      throw new TypeError(`不是整数${position}`);
    }
    let promise = new Promise(resolve => resolve(want));
    if (!(want instanceof Component)) {
      const param = Object.assign(want);
      promise = Component.pjaxFormatHtml(param.url).then(({ template, style }) => {
        param.query = template;
        param.template = template;
        param.style = style;
        const cpt = Component.of(param);
        return cpt;
      });
    }
    promise = promise.then((cpt) => {
      // 把template插入到position的位置
      Dom.of(element).appendAccurate(cpt.template, position);
      const head = Dom.of('head');
      if (!head.hasChild(cpt.style)) {
        head.append(cpt.style);
      }
      cpt.parent = exist;
      return cpt;
    });
    return promise;
  }

  static replaceComponent(want, exist) {
    // 将一个组件实例化对象替换为另一个组件参数或实例化的组件
    // 返回值promise resolve(want)
    if (!Component.isComponent(exist)) { throw new TypeError(`${exist}不是组件实例化对象`); }
    let promise = new Promise(resolve => resolve(want));
    if (!(Component.isComponent(want))) {
      if (!Utils.isString(want.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
      promise = Component.pjaxFormatHtml(want.url).then(({ template, style }) => {
        want.template = template;
        want.style = style;
        want.query = exist.template;
        const cpt = Component.of(want);
        return cpt;
      });
    }
    promise = promise.then((cpt) => {
      Dom.of(exist.template).replace(cpt.template);
      Dom.of(exist.style).replace(cpt.style);
      cpt.parent = exist.parent;
      return cpt;
    });
    return promise;
  }

  static removeComponent(component) {
    // 移除一个组件
    // component是组件实例化对象
    // 返回值promise resolve(component)
    if (!Component.isComponent(component)) { throw new TypeError(`${component}不是一个组件`); }
    const clearTemplate = (cpt) => {
      if (!Component.isComponent(cpt)) { return false; }
      const removed = Dom.of(`*[data-c-id=c${cpt.componentId}]`).remove();
      if (!removed) { return false; }
      return clearTemplate(cpt);
    };
    const destroy = (cpt) => {
      if (!Component.isComponent(cpt)) { return false; }
      Dom.of(cpt.style).remove();
      components.delete(cpt);
      cpt.components.forEach(item => destroy(item));
      cpt.components.clear();
      cpt.parent = null;
      clearTemplate(cpt);
      if (cpt.removed && cpt.removed instanceof Function) { cpt.removed(); }
      return cpt;
    };
    const promise = new Promise((resolve) => {
      destroy(component);
      Dom.of(component.template).remove();
      resolve(component);
    });
    return promise;
  }
}

Component.components = components;
window.Component = Component;


export default Component;

// todo router 把没用的组件占用内存释放
// todo 逐渐替换pjaxCreate 实例对象所有方法改为返回promise
// 改为new Component(param) 立即返回一个Component实例对象，该实例对象有state属性标识是否加载完，若没有则先加载

// todo param有parent属性处理了 是否可以在参数指定parent属性？
// todo Component.replace(param, exist)
// 重构组件操作方法 全部实例对象方法改为返回promise
// todo 提取handleScopedStyle为私有方法
// todo 改为有new进行实例化 立即返回实例化对象，该实例化有state属性判断状态，获取html改为在实例化方法内
// todo custom alert compponent 在新建或更新mission时 content为空时 应该有提示
// todo 应该有一个向组件传递数据的方法 像HTMLElement.innerHTML一样 监视Component.present和Component.data 通过组件参数watch配置
// todo 组件事件监听和派发方法 Component.on(type, callback) Component.sent(type, detail) 实例化后组件内和父组件可以调用
// todo css scoped注释
// todo css scoped @media query
