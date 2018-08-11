import Dom from '../dom';
import utils from '../utils';
import note from '../model/note';

const param = {
  name: 'noteEdit',
  query: 'note-edit',
  url: './assets/templates/noteEdit.html',
  data() {
    return {};
  },
  selectors: {
    create: '*[name=create]',
    content: 'textarea',
    cancal: '*[name=cancal]',
    submit: '*[name=submit]',
  },
  methods: {
    fill() {
      console.log('fill', this.present)
      note.get(this.present.primaryKey)
        .then((res) => {
          const item = res[0];
          this.data.item = item;
          Dom.of(this.elements.content).text(item.content);
        });
    },
    bindEvents() {
      // 撤销按钮
      Dom.of(this.elements.cancal).on('click', () => {
        window.router.methods.render('welcome', { action: 'noteCard' });
      });
      // 提交按钮
      Dom.of(this.elements.submit).on('click', () => {
        const content = this.elements.content.value;
        if (!utils.isEffectiveString(content)) {
          const msg = '内容不能为空';
          window.notice.methods.noticeIn(this.template, msg, 'error');
          return msg;
        }
        const now = new Date();
        let promise;
        if (this.data.item.primaryKey) {
          promise = note.get(this.data.item.primaryKey)
            .then((res) => {
              const data = res[0];
              data.content = content;
              data.updateAt = now;
              return note.update(data);
            });
        } else {
          const data = { content, createdAt: now, updateAt: now };
          promise = note.push(data);
        }
        return promise.then(() => {
          window.router.methods.render('welcome', { action: 'noteCard' });
          const msg = '保存成功';
          window.notice.methods.alert(msg, 'success');
          return msg;
        });
      });
    },
  },
  created() {
    console.log('noteEdit create');
    this.methods.bindEvents();
    this.methods.fill();
  },
};

export default param;
