import Utils from './utils';

const getParent = (element) => {
  if (!Utils.isElement(element)) return false;
  return element.parentNode;
};

const getParents = (element) => {
  if (!Utils.isElement(element)) return false;
  const result = [];
  let parent = element;
  for (let index = 0; index < 999; index += 1) {
    parent = getParent(parent);
    if (!Utils.isElement(parent)) break;
    result.push(parent);
  }
  return result;
};

class Dom {
  constructor(query) {
    if (typeof query === 'string') {
      const eleReg = /^<(.+)>$/;
      const eleMatch = query.match(eleReg);
      if (eleMatch) {
        const tagName = eleMatch[1].toLocaleUpperCase();
        this.dom = document.createElement(tagName);
      } else {
        return document.querySelectorAll(query);
      }
    } else if (query instanceof Dom) {
      this.dom = query.dom;
    } else if (Utils.isElement(query) || (query === document)) {
      this.dom = query;
    } else {
      console.warn(query);
      throw new TypeError('无效参数');
    }
    return this;
  }

  static of(str) {
    return new Dom(str);
  }

  attr(key, value) {
    if (!key || !Utils.isString(key)) throw new TypeError('没有key参数');
    let result = this;
    if (value !== undefined) {
      this.dom.setAttribute(key, `${value}`);
    } else {
      result = this.dom.getAttribute(key);
    }
    return result;
  }

  addClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    const ary = content.split(' ');
    ary.forEach(value => this.dom.classList.add(value));
    return this;
  }

  removeClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    const ary = content.split(' ');
    ary.forEach(value => this.dom.classList.remove(value));
    return this;
  }

  hasClass(content) {
    if (!content || (typeof content !== 'string')) throw new TypeError('参数应该是字符串');
    return this.dom.classList.contains(content);
  }

  append(object) {
    const element = (object instanceof Dom) ? object.dom : object;
    if (!element || (element.nodeType !== 1)) throw new TypeError('参数不是html元素');
    this.dom.appendChild(element);
    return this;
  }

  remove(object) {
    if (!object) {
      this.dom.remove();
    } else if (Utils.isElement(object)) {
      this.dom.removeChild(object);
    } else if (Utils.isString(object)) {
      const element = this.dom.querySelector(object);
      this.dom.removeChild(element);
    }
    return this;
  }

  text(content) {
    this.dom.innerText = content;
    return this;
  }

  html(content) {
    this.dom.innerHTML = content;
    return this;
  }

  find(query) {
    return this.dom.querySelector(query);
  }

  children(query) {
    return this.dom.querySelectorAll(query);
  }

  parent() {
    const parent = this.dom.parentNode;
    const result = (parent && (parent.nodeType === 1)) ? parent : undefined;
    return result;
  }

  parents(query) {
    const parents = getParents(this.dom);
    let result = [];
    if (query && Utils.isString(query)) {
      const all = document.querySelectorAll(query);
      all.forEach((parent) => {
        if (parents.includes(parent)) {
          result.push(parent);
        }
      });
    } else {
      result = parents;
    }
    return result;
  }

  on(event, callback) {
    this.dom.addEventListener(event, callback);
    return this;
  }

  off(event, callback) {
    this.dom.removeEventListener(event, callback);
    return this;
  }
}

export default Dom;
