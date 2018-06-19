import missions from './indexeddb/missions';
import Dom from './dom';
import Mission from './mission';
import datepicker from './lib/datepicker';
import componentMain from './components/main';

const $ = Dom.of;

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.querySelector('input[name=date]');
  const mission = new Mission();
  const topFilters = document.querySelector('#top-filters');
  window.mission = mission;
  window.$ = $;
  mission.createMission();
  window.show = () => (
    missions.ready()
      .then(() => missions.getAll())
      .then(result => console.log(result))
  );
  datepicker(dateInput);
});

componentMain();
