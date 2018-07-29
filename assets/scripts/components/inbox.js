import missionCard from './missionCard';

const card = Object.assign({ present: { days: 'all' } }, missionCard);

const missionInboxParam = {
  query: 'inbox',
  url: './assets/templates/missionInbox.html',
  name: 'missionInbox',
  data() {
    return {};
  },
  components: [card],
};


export default missionInboxParam;
