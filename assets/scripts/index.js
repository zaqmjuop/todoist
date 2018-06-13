import missions from './indexeddb/missions';
import Dom from './dom';
import Mission from './mission';
import datepicker from './datepicker';

const $ = Dom.of;

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.querySelector('input[name=date]');
  const mission = new Mission();
  window.mission = mission;
  window.$ = $;
  mission.createMission();
  window.show = () => (
    missions.ready()
      .then(() => missions.getAll())
      .then(result => console.log(result))
  );
  datepicker(dateInput);
  datepicker(document.getElementById('qwe'));
});
