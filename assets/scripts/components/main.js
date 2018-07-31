import Component from './component';
import routerParam from './router';
import Dom from '../dom';

window.Dom = Dom;

const main = () => {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', () => {
      document.body.style.offsetHeight = `${window.innerHeight}px`;
    });
    window.resizeTo(window.innerWidth, window.innerHeight);
    Component.pjaxCreate(routerParam);
  });
};

export default main;

// todo mission增加state一项
// 页面链接 改为传递 {query: 'all'} {query: 'expired'} {query: 'today'} {query: 'done'} {query: 'undone'}
