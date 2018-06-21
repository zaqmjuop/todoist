import Component from './component';
import Dom from '../dom';

const findPart = (element) => {
  // 返回元素的子元素所有含有part属性的元素集合
  const result = [];
  element.children.forEach((child) => {
    if (child.getAttribute('part')) {
      result.push(child);
    }
  });
  return result;
};

const findParts = (element) => {
  const elementPlayer = Dom.of(element);
  const part = findPart(element);
  console.log(part);
  // const result = {};
  // element.children.forEach((child) => {
  //   console.log(child.getAttribute('part'));
  // });
  return 1;
};

const missionInboxParam = {
  query: 'mission-content',
  url: './assets/components/mission-inbox.html',
  created: () => {
    const parts = findParts(missionInboxParam.template);
    console.log('created', missionInboxParam.template);
  },
};

export default missionInboxParam;
