import Component from './component';
import missionInboxParam from './inbox';
import missionTodayParam from './missionToday';


const missionNextWeekParam = {
  query: 'mission-content',
  url: './assets/components/missionNextWeek.html',
  data() {
    return {};
  },
  created: () => {
  },
};

const main = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const inboxButton = document.querySelector('#inbox');
    const todayButton = document.querySelector('#today');
    const nextWeekButton = document.querySelector('#next-week');
    todayButton.onclick = () => {
      Component.pjaxCreate(missionTodayParam);
    };
    nextWeekButton.onclick = () => {
      Component.pjaxCreate(missionNextWeekParam);
    };
    inboxButton.onclick = () => {
      Component.pjaxCreate(missionInboxParam);
    };
    setTimeout(() => {
      inboxButton.click();
    }, 100);
  });
};

export default main;

