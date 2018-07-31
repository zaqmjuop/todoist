import missionCard from './missionCard';

const missionInboxParam = {
  query: 'inbox',
  url: './assets/templates/missionInbox.html',
  name: 'missionInbox',
  passon: [], // 接受父组件全部present
  data() {
    return {};
  },
  components: [missionCard],
  created() {
  },
};


export default missionInboxParam;
