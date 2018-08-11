import note from "../model/note";
import Dom from "../dom";

const param = {
  name: 'noteItem',
  query: 'note-item',
  url: './assets/templates/noteItem.html',
  data() {
    return { counter: 1 };
  },
  selectors: {
    header: '.header',
    content: 'p',
    edit: '.edit',
  },
  methods: {
    log() {
      console.log(this); // param
    },
    bindEvents() {
      // 修改按钮
      Dom.of(this.elements.edit).on('click', () => {
        window.router.methods.render('welcome', { action: 'noteEdit', primaryKey: this.data.item.primaryKey })
      })
    },
  },
  created() {
    const promise = note.get(this.present.primaryKey)
      .then((res) => {
        const item = res[0];
        this.data.item = item;
        this.methods.bindEvents();
        Dom.of(this.elements.content).text(item.content);
        Dom.of(this.elements.header).text(`${item.createdAt.toLocaleDateString()} ${item.createdAt.toLocaleTimeString()}`)
      })
  },
};

export default param;
