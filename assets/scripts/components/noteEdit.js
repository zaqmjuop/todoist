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
        const detail = {
          content, createdAt: now, updateAt: now,
        };
        let promise;
        if (this.data.primaryKey) {
          promise = note.get(this.data.primaryKey)
            .then((res) => {
              const data = res[0];
              data.content = content;
              data.updateAt = now;
              return note.update(data);
            });
        } else {
          promise = note.push(detail);
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
  },
};

export default param;
