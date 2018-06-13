import Component from './component';

const template = '<div><h1>标题1</h1><h2>标题2</h2></div>';

const newElement = Component.translateIntoElement(template);

const h1 = newElement.querySelector('h1');
const h2 = newElement.querySelector('h2');
h1.addEventListener('click', () => console.log('h1'));
h2.addEventListener('click', () => console.log('h2'));
const tagName = 'component-test';

Component.insertComponents(tagName, newElement);

console.log('qwe');
