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
    remove: '.remove',
  },
  methods: {
    fill() {
      let promise = Promise.resolve(1);
      if (this.present.primaryKey) {
        note.get(this.present.primaryKey)
          .then((res) => {
            this.data.item = res[0];
            Dom.of(this.elements.content).text(res[0].content);
            Dom.of(this.elements.header).text(`${res[0].updatedAt.toLocaleDateString()} ${res[0].updatedAt.toLocaleTimeString()}`);
          });
      }
      return promise;
    },
    bindEvents() {
      // 修改按钮
      Dom.of(this.elements.edit).on('click', () => {
        window.router.methods.render('welcome', { action: 'noteEdit', primaryKey: this.data.item.primaryKey });
      });
      // 删除按钮
      Dom.of(this.elements.remove).on('click', () => {
        Dom.of(this.template).addClass('hide');
        note.remove(this.data.item.primaryKey)
          .then(() => Dom.of(this.template).remove());
      });
    },
  },
  created() {
    this.methods.bindEvents();
    const create = this.methods.fill();
    return create;
  },
};

export default param;
