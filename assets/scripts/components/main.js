import Component from './component';
import routerParam from './router';

let loaded = 0;

const main = () => {
  if (loaded) { return false; }
  document.addEventListener('DOMContentLoaded', () => {
    const inboxButton = document.querySelector('#inbox');
    const todayButton = document.querySelector('#today');
    const nextWeekButton = document.querySelector('#next-week');
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
    });
    setTimeout(() => {
      todayButton.click();
    }, 100);
  });
  loaded = 1;
  return loaded;
};

export default main;

