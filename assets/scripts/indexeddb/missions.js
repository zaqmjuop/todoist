import Store from './store';

const missions = new Store('Missions');

missions.create = item => missions.set(item);

missions.save = item => missions.set(item);

let inited = 0;

const init = () => {
  if (inited) { return missions; }
  inited = 1;
  const promise = missions.ready().then(() => {
    const addColumns = missions.addColumns(['date', 'content', 'order']);
    return addColumns;
  });
  return promise;
};

init();

export default missions;
