import Store from './store';

const missions = new Store('Missions');

missions.create = item => missions.set(item);

missions.save = item => missions.set(item);

missions.init = () => {
  if (missions.init === 1) { return this; }
  missions.init = 1;
  return missions.ready().then(() => missions.addColumns(['date', 'content', 'order']));
};
missions.init();

export default missions;
