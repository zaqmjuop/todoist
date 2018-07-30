import missionCard from './missionCard';

const card = Object.assign({ present: { days: 'all' } }, missionCard);

const missionInboxParam = {
  query: 'inbox',
  url: './assets/templates/missionInbox.html',
  name: 'missionInbox',
  passon: [],
  data() {
    return {};
  },
  components: [card],
  created() {
    console.log('box', this)
  },
};


export default missionInboxParam;
