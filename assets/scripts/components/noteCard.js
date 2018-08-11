import Dom from '../dom';

const param = {
  name: 'noteCard',
  query: 'note-card',
  url: './assets/templates/noteCard.html',
  data() {
    return {};
  },
  selectors: {
    create: '*[name=create]',
  },
  methods: {
    bindEvents() {
      // 进入新建note界面
      Dom.of(this.elements.create).on('click', () => {
        window.router.methods.render('welcome', { action: 'noteEdit' });
      });
    },
  },
  created() {
    console.log('noteCard create');
    this.methods.bindEvents();
  },
};

export default param;
