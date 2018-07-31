import leftMenu from './leftMenu';
import missionCard from './missionCard';

const param = {
  query: 'mission-content',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  data() {
    return {};
  },
  components: [leftMenu, missionCard],
};
export default param;
