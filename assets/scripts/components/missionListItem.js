import Dom from '../dom';
import missions from '../indexeddb/missions';
import Component from './component';

const param = {
  query: 'mission-list-item',
  url: './assets/components/missionListItem.html',
  selectors: {
    content: '.item-content',
    date: '.item-date',
    done: '.done',
    itemMain: '.item-main',
    counter: '#counter',
  },
  data() {
    return {
      counter: 1,
      inited: 0,
    };
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.bindEvents();
      return this;
    },
    savePresent() {
      this.data.content = this.present.content;
      this.data.date = this.present.date;
      this.data.id = this.present.id;
      this.data.formId = this.present.formId;
      this.data.parentCid = this.present.cid;
      return this;
    },
    bindEvents() {
      // 删除自己
      Dom.of(this.elements.done).on('click', () => {
        missions.ready().then(() => {
          const id = Number(this.data.id);
          return missions.delete(id);
        }).then(() => {
          Dom.of(this.template).selfDestruct();
        });
      });
      // 更新自己
      Dom.of(this.elements.content).on('click', () => {
        // 替换当前组件为missionForm
        // 如果missionForm有data-cid属性 说明missionForm被其他组件替换，应先还原
        if (!this.data.formId) { return false; }
        const detail = {
          cid: this.componentId,
          content: this.data.content,
          date: this.data.date,
          id: this.data.id,
          formId: this.data.formId,
        };
        const missionForm = Component.find(detail.formId);
        missionForm.present = detail;
        const beforeCid = Dom.of(missionForm.template).attr('data-cid');
        if (beforeCid) {
          const beforeComponent = Component.find(beforeCid);
          if (beforeComponent) {
            missionForm.replaceSelf(beforeComponent);
          }
        }
        this.replaceSelf(missionForm);
        return this;
      });
    },
    fill() {
      Dom.of(this.elements.content).attr('text', this.data.content);
      Dom.of(this.elements.date).attr('text', this.data.date);
      Dom.of(this.template).attr('data-item-id', this.data.id);
    },
  },
  created() {
    this.methods.init();
    this.methods.savePresent();
    this.methods.fill();
  },
};

export default param;
