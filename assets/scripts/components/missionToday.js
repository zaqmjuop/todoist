import missionCardExpired from './missionCardExpired';
import missionCard from './missionCard';

const card = Object.assign({ present: { date: new Date() } }, missionCard);

const param = {
  query: 'mission-content',
  url: './assets/components/missionToday.html',
  name: 'missionToday',
  data() {
    return {};
  },
  components: [missionCardExpired, card],
};
export default param;
