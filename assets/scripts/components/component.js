import Utils from '../utils';

const translateIntoElement = (template) => {
  if (!Utils.isString(template)) throw new TypeError('只接受字符串类型的html模板参数');
  const holder = document.createElement('DIV');
  holder.innerHTML = template;
  if (holder.childElementCount !== 1) throw new Error('html模板最外层应该只有一个元素包裹');
  return holder.firstChild;
};

const insertComponents = (tagName, element) => {
  if (!Utils.isString(tagName)) throw new TypeError(`tagName不能为${tagName}`);
  if (!Utils.isElement(element)) throw new TypeError(`element不能为${element}`);
  const items = document.querySelectorAll(tagName);
  items.forEach((item) => {
    const parent = item.parentElement;
    parent.replaceChild(element, item);
  });
  return element;
};

const insertTemplates = (tagName, template) => {
  const element = translateIntoElement(template);
  return insertComponents(tagName, element);
};

export default {
  translateIntoElement,
  insertComponents,
  insertTemplates,
};
