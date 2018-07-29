import leftMenu from './leftMenu';
import inbox from './inbox';

const param = {
  query: 'mission-content',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  data() {
    return {};
  },
  components: [leftMenu, inbox],
};
export default param;
