import Component from './component';
import routerParam from './router';
import Dom from '../dom';

let loaded = 0;
const home = window.location.href.match(/^[^#]+/)[0];
window.Dom = Dom;

const main = () => {
  if (loaded) { return false; }
  document.addEventListener('DOMContentLoaded', () => {
    const logo = Dom.of('#logo').dom;
    Dom.of(logo).on('click', () => window.location.assign(home));
    Component.pjaxCreate(routerParam);
  });
  loaded = 1;
  return loaded;
};

export default main;

