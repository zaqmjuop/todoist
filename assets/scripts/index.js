import Dom from './dom';
// import Mission from './mission';
import componentMain from './components/main';

componentMain();
document.addEventListener('DOMContentLoaded', () => {
  window.$ = Dom.of;
  
  // const mission = new Mission();
  // window.mission = mission;
  // mission.createMission();
});

