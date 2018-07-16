import Component from './component';
import routerParam from './router';
import Dom from '../dom';

let loaded = 0;
const home = window.location.href.match(/^[^#]+/)[0];

const main = () => {
  if (loaded) { return false; }
  document.addEventListener('DOMContentLoaded', () => {
    const inboxButton = document.querySelector('#inbox');
    const todayButton = document.querySelector('#today');
    const nextWeekButton = document.querySelector('#next-week');
    const logo = Dom.of('#logo').dom;
    Dom.of(logo).on('click', () => window.location.assign(home));
    Component.pjaxCreate(routerParam).then((router) => {
      window.router = router;
      inboxButton.onclick = () => {
        router.methods.render('inbox');
      };
      todayButton.onclick = () => {
        router.methods.render('today');
      };
      nextWeekButton.onclick = () => {
        router.methods.render('nextWeek');
      };
    }).then(() => {
      todayButton.click();
    });
  });
  loaded = 1;
  return loaded;
};

export default main;

