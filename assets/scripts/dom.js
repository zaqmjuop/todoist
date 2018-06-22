
const isString = (str) => {
  const result = (typeof str === 'string');
  return result;
};

const isEffectiveString = (str) => {
  const result = !!(str && isString(str));
  return result;
};

const collectClasses = (classes) => {
  if (!isEffectiveString(classes)) { throw new TypeError(`参数classes不能为 ${classes}`); }
  return classes.replace(/\s+/g, ' ').split(' ');
};

let isGlobalInited = 0;

class Dom {
  constructor(query) {
    // 允许的参数类型 1.Dom实例对象 2.HTMLElement 3.创建元素所需tagName 4.querySelector
    // 查找只用querySelector匹配符合条件的第一个元素 查找集合用Dom.all(query)
    if (!query) { throw new TypeError('参数无效'); }
    if (query instanceof Dom) {
      // 参数是Dom的实例对象
      this.dom = query.dom;
    } else if (query instanceof HTMLElement) {
      // 参数是元素
      this.dom = query;
    } else if (isEffectiveString(query)) {
      const isCreateReg = /^<(.+)>$/;
      const createMatch = query.match(isCreateReg);
      if (createMatch) {
        // 创建元素 如('<div>')
        this.dom = document.createElement(createMatch[1]);
      } else {
        // 查找元素
        this.dom = document.querySelector(query);
      }
    }
    return this;
  }

  static all(query) {
    return document.querySelectorAll(query);
  }

  static of(str) {
    return new Dom(str);
  }

  static degenerate(query) {
    // 参数的类型
    // 参数如果是Dom的实例对象,则返回该实例包含的HTMLElement
    // 参数如果是HTMLElement,则返回参数自身
    // 参数如果是query则返回querySelector的结果
    let result;
    if (query instanceof Dom) {
      result = query.dom;
    } else if (query instanceof HTMLElement) {
      result = query;
    } else if (isEffectiveString(query)) {
      result = document.querySelector(query);
    } else {
      throw new TypeError(`参数query不能是${query}`);
    }
    return result;
  }

  attr(key, value) {
    // 查看或修改元素的属性
    // 如果参数key是text或html 则修改innerText或innerHTML
    if (!isEffectiveString(key)) { throw new TypeError(`参数key不能为 ${key}`); }
    let result;
    if (key.toLocaleLowerCase().match(/^text$/)) {
      // this.attr(text[,innerText])
      result = this.text(value);
    } else if (key.toLocaleLowerCase().match(/^html$/)) {
      // this.attr(html[,innerHTML])
      result = this.html(value);
    } else if ((this.dom.tagName === 'INPUT') && (key === 'value')) {
      // this.attr(value[, val])
      if (value !== undefined) {
        this.dom.value = String(value);
        result = this;
      } else {
        result = this.dom.value;
      }
    } else if (value !== undefined) {
      // 默认情况设置属性
      this.dom.setAttribute(key, value);
      result = this;
    } else {
      // 默认情况查看属性
      result = this.dom.getAttribute(key);
    }
    return result;
  }

  addClass(classes) {
    // 添加class
    const collect = collectClasses(classes);
    collect.forEach((clas) => {
      if (!this.dom.classList.contains(clas)) {
        this.dom.classList.add(clas);
      }
    });
    return this;
  }

  removeClass(classes) {
    // 移除class
    const collect = collectClasses(classes);
    collect.forEach((clas) => {
      if (this.dom.classList.contains(clas)) {
        this.dom.classList.remove(clas);
      }
    });
    return this;
  }

  hasClass(classes) {
    // 判断是否含有class 如果参数是classes 那么只有全部classes都含有时返回true
    const collect = collectClasses(classes);
    let result = true;
    collect.forEach((clas) => {
      if (!this.dom.classList.contains(clas)) {
        result = false;
      }
    });
    return result;
  }

  toggleClass(classes) {
    // 切换class存在 如果参数是classes 那么只有全部classes存在才算存在
    const isClassesExist = this.hasClass(classes);
    if (isClassesExist) {
      this.removeClass(classes);
    } else {
      this.addClass(classes);
    }
    return this;
  }

  append(query) {
    // 添加元素 如果参数是Selector，则对所有匹配元素操作
    const elements = isEffectiveString(query)
      ? document.querySelectorAll(query)
      : [Dom.degenerate(query)];
    elements.forEach((element) => {
      this.dom.appendChild(element);
    });
    return this;
  }

  remove(query) {
    // 删除元素 如果参数是Selector，则对所有匹配元素操作
    const elements = isEffectiveString(query)
      ? this.dom.querySelectorAll(query)
      : [Dom.degenerate(query)];
    elements.forEach((element) => {
      this.dom.removeChild(element);
    });
    return this;
  }

  text(content) {
    // 查看或修改innerText
    let result;
    if (content !== undefined) {
      this.dom.innerText = String(content);
      result = this;
    } else {
      result = this.dom.innerText;
    }
    return result;
  }

  html(content) {
    // 查看或修改innerHTML
    let result;
    if (content !== undefined) {
      this.dom.innerHTML = String(content);
      result = this;
    } else {
      result = this.dom.innerHTML;
    }
    return result;
  }

  child(query) {
    // 查找单个子元素
    let element;
    if (isEffectiveString(query)) {
      element = this.dom.querySelector(query);
    } else {
      element = Dom.degenerate(query);
    }
    return element;
  }

  children(selector) {
    // 查找子元素集合 若没有参数则返回children()
    let elements;
    if (selector === undefined) {
      elements = this.dom.children();
    } else {
      if (!isEffectiveString(selector)) { throw new TypeError(`selector不能为${selector}`); }
      elements = this.dom.querySelectorAll(selector);
    }
    return elements;
  }

  parent(query) {
    // 查找单个父元素 query可选 可以是querySelector或Dom实例对象
    return Dom.getParent(this.dom, query);
  }

  parents(query) {
    // 查找父元素集合 query可选 可以是querySelector
    return Dom.getParents(this.dom, query);
  }

  hasParent(query) {
    // 查看是否存在query匹配的父元素 query可以是querySelector或Dom实例对象
    return Dom.hasParent(this.dom, query);
  }

  on(event, callback) {
    // 绑定事件
    if (!isEffectiveString(event)) { throw new TypeError(`event不能是${event}`); }
    if (typeof callback !== 'function') { throw new TypeError(`callback不能是${callback}`); }
    this.dom.addEventListener(event, callback);
    return this;
  }

  off(event, callback) {
    // 取消事件
    if (!isEffectiveString(event)) { throw new TypeError(`event不能是${event}`); }
    if (typeof callback !== 'function') { throw new TypeError(`callback不能是${callback}`); }
    this.dom.removeEventListener(event, callback);
    return this;
  }

  clear(event) {
    // 清空事件
    if (!isEffectiveString(event)) { throw new TypeError(`event不能是${event}`); }
    this.dom[`on${event}`] = undefined;
    return this;
  }

  static isElement(element) {
    // 是否是HTMLElement
    return element && (element instanceof HTMLElement) && (element.nodeType === 1);
  }

  static getParentsTree(element) {
    // 获取父元素树
    if (!Dom.isElement(element)) { throw new TypeError(`element不能是${element}`); }
    const tree = [];
    let buffer = element;
    while (buffer.parentElement) {
      buffer = buffer.parentElement;
      tree.push(buffer);
    }
    return tree;
  }

  static getParent(element, query) {
    // 查找单个父元素 element是HTMLElement, query可选 可以是querySelector或Dom实例对象
    if (!Dom.isElement(element)) { throw new TypeError(`element不能是${element}`); }
    let result;
    const tree = Dom.getParentsTree(element);
    const all = document.querySelectorAll(query);
    if (query === undefined) {
      result = element.parentElement;
    } else {
      let parentsCollect;
      if (isEffectiveString(query)) {
        parentsCollect = tree;
      } else if (query instanceof Dom) {
        parentsCollect = [query.dom];
      } else {
        throw new TypeError(`query不能是${query}`);
      }
      parentsCollect.forEach((parent) => {
        all.forEach((item) => {
          if (item.isSameNode(parent)) {
            result = parent;
          }
        });
      });
    }
    return result;
  }

  static getParents(element, query) {
    // 查找父元素集合 element是HTMLElement, query可选 可以是querySelector
    if (!Dom.isElement(element)) { throw new TypeError(`element不能是${element}`); }
    let result;
    const tree = Dom.getParentsTree(element);
    const all = document.querySelectorAll(query);
    if (query === undefined) {
      result = tree;
    } else {
      let parentsCollect;
      result = [];
      if (isEffectiveString(query)) {
        parentsCollect = tree;
      } else {
        throw new TypeError(`query不能是${query}`);
      }
      parentsCollect.forEach((parent) => {
        all.forEach((item) => {
          if (item.isSameNode(parent)) {
            result.push(parent);
          }
        });
      });
    }
    return result;
  }

  static hasParent(element, query) {
    // 查看是否存在query匹配的父元素 query可以是querySelector或Dom实例对象
    if ((!isEffectiveString(query)) && !(query instanceof Dom)) { throw new TypeError(`query不能是${query}`); }
    return !!Dom.getParent(element, query);
  }

  static globalInit() {
    if (isGlobalInited) { return false; }
    isGlobalInited += 1;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
    return isGlobalInited;
  }
}

Dom.globalInit();

export default Dom;
