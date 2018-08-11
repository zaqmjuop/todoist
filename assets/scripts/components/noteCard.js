import Dom from '../dom';
import note from '../model/note';
import noteItem from './noteItem';

const param = {
  name: 'noteCard',
  query: 'note-card',
  url: './assets/templates/noteCard.html',
  data() {
    return {};
  },
  selectors: {
    create: '*[name=create]',
    cardBody: '.card-body',
  },
  methods: {
    loadDB() {
      return note.getAll()
        .then((items) => {
          this.data.items = items;
        });
    },
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
    const init = this.methods.loadDB()
      .then(() => {
        let promise = Promise.resolve(1);
        this.data.items.forEach((item) => {
          const itemParam = Object.assign({ present: item }, noteItem);
          promise = promise
            .then(() => this.appendChild(itemParam, this.elements.cardBody, -1));
        });
      });
    return init;
  },
};

export default param;
