const isKeyEnter = event => ((event instanceof KeyboardEvent) && (event.keyCode === 13));

const isElement = element => (element && (element.nodeType === 1));

const isString = str => (str && (typeof str === 'string'));

const isFunction = (param) => {
  const res = param && (typeof param === 'function');
  return res;
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
};
