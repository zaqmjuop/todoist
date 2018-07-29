const isKeyEnter = event => ((event instanceof KeyboardEvent) && (event.keyCode === 13));

const isElement = element => (element && (element.nodeType === 1));

const isString = str => (str && (typeof str === 'string'));

const isFunction = (param) => {
  const res = param && (typeof param === 'function');
  return res;
};

const now = new Date();

const formatDate = (parameter) => {
  // parameter可以是表示时间字符串 如'2018/01/01'或'2018-01-01'或Date
  // 返回表示时间的字符串格式'2018-01-01'
  const date = (parameter && parameter instanceof Date)
    ? parameter
    : new Date(String(parameter));
  const result = (date.getTime()) ? date.toLocaleDateString().replace(/\//g, '-') : '';
  return result;
};

const newPromise = () => new Promise(resolve => resolve(1));

const isEmptyString = (content) => {
  // 是否是空Falsely或空字符串
  const isFalsely =
    (content === null) ||
    (content === undefined) ||
    (content === false) ||
    (content === []) ||
    (content === {});
  const isEmpty = !String(content).match(/\S/);
  return isFalsely || isEmpty;
};

export default {
  isElement,
  isKeyEnter,
  isString,
  isFunction,
  isEmptyString,
  newPromise,
  formatDate,
  now,
};
