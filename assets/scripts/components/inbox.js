import Dom from '../dom';
import datepicker from '../lib/datepicker';
import missions from '../indexeddb/missions';
import Component from './component';
import missionListItemParam from './missionListItem';

const missionInboxParam = {
  query: 'mission-content',
  url: './assets/components/missionInbox.html',
  data: {
    counter: 0,
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
      if (!content) { return false; }
      this.data.counter += 1;
      const model = { content, date, order: this.data.counter };
      missions.ready()
        .then(() => missions.create(model))
        .then((id) => {
          // listItem应该是另一个子组件
          // const listItem = Mission.createMissionItem(contentInput.value, dateInput.value, id);
          // Dom.of(this.elements.list).append(listItem);
          const listItem = Dom.of('<mission-list-item>').dom;
          Dom.of(this.elements.list).append(listItem);
          missionListItemParam.present = model;
          Component.pjaxCreate(missionListItemParam);
          // 尝试
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
    datepicker(this.elements.dateInput);
    Dom.of(this.elements.showForm).on('click', (event) => {
      // 展开form
      Dom.of(this.elements.form).attr('data-item-id', '').removeClass('hide');
      event.preventDefault();
      this.elements.contentInput.focus();
    });
    Dom.of(this.elements.cancelForm).on('click', () => {
      // 隐藏form
      Dom.of(this.elements.form).addClass('hide');
      this.elements.contentInput.blur();
    });
    Dom.of(this.elements.submit).on('click', () => {
      // 提交表单
      const itemId = Dom.of(this.elements.form).attr('data-item-id');
      if (!itemId) {
        this.methods.createMission();
      } else {
        this.methods.updateMission();
      }
    });
  },
};


export default missionInboxParam;
