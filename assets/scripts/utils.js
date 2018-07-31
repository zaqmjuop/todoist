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

const formatTime = (date) => {
  if (!(date instanceof Date)) { throw new TypeError(`formatTime 参数date不能是${date}`); }
  const str = date.toTimeString().match(/^\S+/)[0];
  return str;
};

const isValidDate = (date) => {
  const result = date && date instanceof Date && date.getTime();
  return result;
};

const newPromise = () => new Promise(resolve => resolve(1));

const differDay = (datea, dateb) => {
  // 两个日期相差几日 返回值是一个整数 1代表dateb是datea的后一天 -1代表dateb是datea的前一天 0代表是同一天
  if (!(datea instanceof Date) || !(dateb instanceof Date)) {
    throw new TypeError(`differDay的参数不能是 ${datea} 和 ${dateb}`);
  }
  const dateaStart = datea;
  const datebStart = dateb;
  const msecs = datebStart.getTime() - dateaStart.getTime();
  const days = msecs / 86400000;
  return days;
};

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
  formatTime,
  now,
  isValidDate,
  differDay,
};
