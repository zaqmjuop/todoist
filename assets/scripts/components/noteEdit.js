import Dom from '../dom';

const param = {
  name: 'noteEdit',
  query: 'note-edit',
  url: './assets/templates/noteEdit.html',
  data() {
    return {};
  },
  selectors: {
    create: '*[name=create]',
  },
  methods: {
  },
  created() {
    console.log('noteEdit create');
  },
};

export default param;
