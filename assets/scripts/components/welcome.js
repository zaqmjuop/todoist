import leftMenu from './leftMenu';
import inbox from './inbox';

const param = {
  query: 'mission-content',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  data() {
    return {
      initen: 0,
    };
  },
  methods: {
    init() {
      if (this.inited) { return false; }
      this.inited = 1;
      this.methods.takePart();
      return this;
    },
    takePart() {
      const inboxasd = 1;
    },
  },
  created() {
    console.log(this.present);
    this.methods.init();
  },
  components: [leftMenu, inbox],
};
export default param;
