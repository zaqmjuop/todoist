
const param = {
  name: 'noteItem',
  query: 'note-item',
  url: './assets/templates/noteItem.html',
  data() {
    return { counter: 1 };
  },
  selectors: {
    div: 'div',
  },
  methods: {
    log() {
      console.log(this); // param
    },
  },
  created() { console.log('create'); },
  implanted() { console.log('implanted'); },
};

export default param;
