import missions from './indexeddb/missions';
import Dom from './dom';
import Mission from './mission';

const $ = Dom.of;

document.addEventListener('DOMContentLoaded', () => {
  const mission = new Mission();
  window.mission = mission;
  window.$ = $;
  mission.createMission();
  window.show = () => (
    missions.ready()
      .then(() => missions.getAll())
      .then(result => console.log(result))
  );
});
