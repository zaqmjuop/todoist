const isKeyEnter = event => ((event instanceof KeyboardEvent) && (event.keyCode === 13));

const isElement = element => (element && (element.nodeType === 1));

const isString = str => (str && (typeof str === 'string'));

const isFunction = (param) => {
  const res = param && (typeof param === 'function');
  return res;
};

export default {
  isElement,
  isKeyEnter,
  isString,
  isFunction,
};
