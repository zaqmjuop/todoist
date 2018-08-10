import ArrayStorage from 'arraystorage';
import utils from './utils';

const mission = new ArrayStorage();

const getAll = () => {
  const filter = mission.getAll();
  return filter;
};
const getExpired = () => {
  const filter = mission.filter((item) => {
    const isNeed = (item.date instanceof Date) && (utils.differDay(item.date, utils.now) > 0);
    return isNeed;
  });
  return filter;
};
const getDone = () => {
  const filter = mission.filter(item => (item.state === 'done'));
  return filter;
};
const getUndone = () => {
  const filter = mission.filter(item => (item.state !== 'done'));
  return filter;
};

const defaultQuery = {
  all: getAll,
  expired: getExpired,
  done: getDone,
  undone: getUndone,
};


const getDate = () => {
  const filter = mission.filter((item) => {
    const isNeed = (item.date instanceof Date) && (utils.differDay(item.date, utils.now) > 0);
    return isNeed;
  });
  return filter;
};
const getMark = (mark) => {
  const filter = mission.filter((item) => {
    const isNeed = (typeof item.mark === 'string') && item.mark === String(mark);
    return isNeed;
  });
  return filter;
};
const getQuery = (query) => {
  let result;
  if (typeof query === 'string') {
    if (defaultQuery[query]) {
      result = defaultQuery[query]();
    } else {
      result = getMark(query);
    }
  } else if (query instanceof Date) {
    result = getDate(query);
  } else {
    console.warn(`mission.methods.GetQuery 尚不支持查询${query}`);
  }
  return result;
};

mission.quadrants = [
  { important: undefined, urgent: undefined },
  { important: 1, urgent: 1 },
  { important: 1, urgent: 0 },
  { important: 0, urgent: 1 },
  { important: 0, urgent: 0 },
];

mission.methods = {
  getAll, getExpired, getDate, getMark, getQuery,
};

export default mission;

