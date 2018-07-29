import missionCard from './missionCard';
import utils from '../utils';

const nowYear = utils.now.getFullYear();
const nowMonth = utils.now.getMonth();
const nextWeek = [0, 1, 2, 3, 4, 5, 6].map((item, index) => {
  const date = new Date(nowYear, nowMonth, (utils.now.getDate() + index));
  return date;
});
const nextWeekParams = nextWeek.map((day) => {
  const dayParam = Object.assign({ present: { date: day } }, missionCard);
  return dayParam;
});

const param = {
  query: 'mission-content',
  url: './assets/templates/missionNextWeek.html',
  name: 'missionNextWeek',
  data() {
    return {};
  },
  components: [...nextWeekParams],
};

export default param;
