import missionCard from './missionCard';

const card = Object.assign({ present: { date: new Date() } }, missionCard);
const expired = Object.assign({ present: { days: 'expired' } }, missionCard);

const param = {
  query: 'mission-content',
  url: './assets/components/missionToday.html',
  name: 'missionToday',
  data() {
    return {};
  },
  components: [card, expired],
};
export default param;
