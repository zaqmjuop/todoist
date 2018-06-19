import Component from './component';

const missionTodayParam = {
  query: 'mission-content',
  url: './assets/components/mission-today.html',
  created: () => {
    console.log('created', missionTodayParam.template);
  },
};

const missionNextWeekParam = {
  query: 'mission-content',
  url: './assets/components/mission-next-week.html',
  created: () => {
    console.log('created', missionNextWeekParam.template);
  },
};

const main = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const todayButton = document.querySelector('#today');
    const nextWeekButton = document.querySelector('#next-week');
    todayButton.onclick = () => {
      Component.pjaxCreate(missionTodayParam);
    };
    nextWeekButton.onclick = () => {
      Component.pjaxCreate(missionNextWeekParam);
    };
  });
};

export default main;

