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
      // 读取this.present.primaryKey并填充
      const primaryKey = Number(this.present.primaryKey);
      let promise = Promise.resolve(1);
      if (primaryKey) {
        promise = note.get(primaryKey)
          .then((res) => {
            this.data.item = res[0];
            Dom.of(this.elements.content).text(this.data.item.content);
          });
      }
      return promise;
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
        const primaryKey = this.data.item && this.data.item.primaryKey;
        if (primaryKey) {
          promise = note.get(primaryKey)
            .then((res) => {
              const item = res[0];
              item.content = content;
              item.updatedAt = now;
              return note.update(item);
            });
        } else {
          const data = { content, createdAt: now, updatedAt: now };
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
    this.methods.bindEvents();
    this.methods.fill();
  },
};

export default param;
