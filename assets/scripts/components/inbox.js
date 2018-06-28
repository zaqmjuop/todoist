import Dom from '../dom';
import datepicker from '../lib/datepicker';
import missions from '../indexeddb/missions';
import Component from './component';
import missionListItemParam from './missionListItem';
import Utils from '../utils';
import missionForm from './missionForm';

const missionInboxParam = {
  query: 'mission-content',
  url: './assets/components/missionInbox.html',
  data() {
    return {
      counter: 0,
      formSeen: false,
    };
  },
  selectors: {
    form: '.form',
    showForm: '.show-form',
    contentInput: 'input[name=content]',
    dateInput: 'input[name=date]',
    cancelForm: '.cancel-form',
    submit: '.submit',
    list: '.body ul',
  },
  methods: {
    createMission() {
      // 创建一条任务
      const content = Dom.of(this.elements.contentInput).attr('value');
      const date = Dom.of(this.elements.dateInput).attr('value');
      if (Utils.isEmptyString(content)) { return false; }
      this.data.counter += 1;
      const model = { content, date, order: this.data.counter };
      missions.ready()
        .then(() => missions.create(model))
        .then((id) => {
          // 添加 li item
          const listItem = Dom.of('<mission-list-item>').dom;
          Dom.of(this.elements.list).append(listItem);
          missionListItemParam.present = Object.assign(model, { id });
          Component.pjaxCreate(missionListItemParam);
          Dom.of(this.elements.contentInput).attr('value', '');
          Dom.of(this.elements.dateInput).attr('value', '');
        });
      Dom.of(this.elements.form).attr('data-item-id', '');
      return this;
    },
    updateMission() {
      // 更新一条任务
      const itemId = Dom.of(this.elements.form).attr('data-item-id');
      if (!itemId) { return false; }
      const item = Dom.of(`#${itemId}`);
      if (!item) { throw new ReferenceError(`找不到#${itemId}元素`); }
      const content = this.elements.contentInput.value;
      const date = this.elements.dateInput.value;
      const id = Number(itemId.match(/^item-(\d+)$/)[1]);
      const data = { id, content, date };
      missions.ready()
        .then(() => missions.save(data))
        .then(() => {
          Dom.of(item).child('.item-content').attr('text', content);
          Dom.of(item).child('.item-date').attr('text', date);
          Dom.of(item).removeClass('hide');
          this.elements.contentInput.attr('value', '');
          this.elements.dateInput.attr('value', '');
          Dom.of(this.elements.form).addClass('hide');
        });
      return this;
    },
  },
  created() {
    // this.appendComponent(missionForm);
    datepicker(this.elements.dateInput);
    Dom.of(this.elements.showForm).on('click', (event) => {
      // 展开form
      Dom.of(this.elements.form).attr('data-item-id', '').removeClass('hide');
      this.elements.contentInput.focus();
      event.stopPropagation();
    });
    Dom.of(this.elements.cancelForm).on('click', (event) => {
      // 隐藏form
      Dom.of(this.elements.form).addClass('hide');
      this.elements.contentInput.blur();
      event.stopPropagation();
    });
    Dom.of(this.elements.submit).on('click', (event) => {
      // 提交表单
      const itemId = Dom.of(this.elements.form).attr('data-item-id');
      if (!itemId) {
        this.methods.createMission();
      } else {
        // todo
        this.methods.updateMission();
      }
      event.stopPropagation();
    });
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
        Dom.of(this.elements.list).append(listItem);
        missionListItemParam.childBridge = () => data;
        missionListItemParam.present = data;
        this.appendComponent(missionListItemParam);
      });
    });
  },
};


export default missionInboxParam;
