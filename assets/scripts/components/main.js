import Component from './component';
import routerParam from './router';
import Dom from '../dom';

let loaded = 0;
const home = window.location.href.match(/^[^#]+/)[0];
window.Dom = Dom;

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
        router.methods.render('missionInboxParam');
      };
      todayButton.onclick = () => {
        router.methods.render('missionTodayParam');
      };
      nextWeekButton.onclick = () => {
        router.methods.render('missionNextWeekParam');
      };
    }).then(() => {
      todayButton.click();
    });
  });
  loaded = 1;
  return loaded;
};

export default main;

