import Dom from '../dom';
import missions from '../indexeddb/missions';
import Component from './component';
import missionListItemParam from './missionListItem';
import missionForm from '../components/missionForm';

const missionInboxParam = {
  query: 'mission-content',
  url: './assets/components/missionInbox.html',
  name: 'missionInbox',
  data() {
    return {
      counter: 0,
      formSeen: false,
    };
  },
  selectors: {
    showForm: '.show-form',
    list: '.body ul',
    createMission: '.create-mission',
  },
  methods: {
    loadDB() {
      missions.ready().then(() => {
        const promiseAll = missions.getAll();
        return promiseAll;
      }).then((datas) => {
        const sortByDate = datas.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() > dateB.getTime();
        });
        sortByDate.forEach((data) => {
          // 添加 li item
          const listItem = Dom.of('<mission-list-item>').dom;
          Dom.of(listItem).insertBefore(this.elements.createMission);
          const present = Object.assign(data, { formId: this.data.formId });
          const liParam = Object.assign({ present }, missionListItemParam);
          Component.pjaxCreate(liParam);
        });
      });
    },
    initForm() {
      // 添加form
      const position = Dom.of('<mission-form>').dom;
      Dom.of(position).insertBefore(this.elements.createMission);
      Component.pjaxCreate(missionForm).then((formCpt) => {
        formCpt.methods.hide();
        this.data.formId = formCpt.componentId;
        return formCpt;
      }).then((formCpt) => {
        // 显示新建表单
        Dom.of(this.elements.showForm).on('click', () => {
          // 若存在data-cid属性 先还原
          const beforeCid = Dom.of(formCpt.template).attr('data-cid');
          if (beforeCid) {
            const beforeComponent = Component.find(beforeCid);
            if (beforeComponent) {
              formCpt.replaceSelf(beforeComponent);
            }
          }
          // 还原属性
          Dom.of(position).insertBefore(this.elements.createMission);
          formCpt.present = {};
          formCpt.replaceElement(position);
          formCpt.methods.show();
        });
        return formCpt;
      }).then((formCpt) => {
        // 表单新建
        formCpt.addEventListener('create', (e) => {
          if (!e.detail.content) { return false; }
          missions.ready().then(() => {
            const create = missions.set(e.detail);
            return create;
          }).then((result) => {
            // 添加 li item
            const listItem = Dom.of('<mission-list-item>').dom;
            Dom.of(listItem).insertBefore(this.elements.createMission);
            const present = {
              formId: this.data.formId,
              content: e.detail.content,
              date: e.detail.date,
              id: result,
            };
            const liParam = Object.assign({ present }, missionListItemParam);
            const li = Component.pjaxCreate(liParam);
            return li;
          }).then((li) => {
            formCpt.refresh();
            formCpt.methods.hide();
            li.template.focus();
          });
          return formCpt;
        });
        // 更新表单
        formCpt.addEventListener('update', (e) => {
          if (!e.detail.content) { return false; }
          const updateData = {
            content: e.detail.content,
            date: e.detail.date,
            id: e.detail.id,
          };
          missions.ready().then(() => {
            const save = missions.set(updateData);
            return save;
          }).then(() => {
            // 更新后将form替换为li
            const li = Component.find(e.detail.cid);
            li.present.content = updateData.content;
            li.present.date = updateData.date;
            li.present.id = updateData.id;
            formCpt.replaceSelf(li);
          });
          return formCpt;
        });
      });
    },
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.initForm();
      return this;
    },
  },
  created() {
    this.methods.loadDB();
    this.methods.init();
  },
};


export default missionInboxParam;
