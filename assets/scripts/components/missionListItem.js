import Dom from '../dom';
import missions from '../indexeddb/missions';

const param = {
  query: 'mission-list-item',
  url: './assets/components/missionListItem.html',
  selectors: {
    content: '.item-content',
    date: '.item-date',
    done: '.done',
    'item-main': '.item-main',
    counter: '#counter',
  },
  data() {
    return {
      counter: 1,
    };
  },
  created() {
    Dom.of(this.elements.content).attr('text', this.present.content);
    Dom.of(this.elements.date).attr('text', this.present.date);
    Dom.of(this.elements.template).attr('id', `item-${this.present.id}`);
    Dom.of(this.elements.done).on('click', () => {
      // 删除自己
      missions.ready()
        .then(() => missions.delete(Number(this.present.id)))
        .then(() => Dom.of(this.template).selfDestruct());
    });
    Dom.of(this.elements.counter).on('click', () => {
      this.data.counter += 1;
    });
    this.data.counter = 1;
  },
  watch() {
    return {
      counter: () => {
        Dom.of(this.elements.counter).attr('text', this.data.counter);
      },
    };
  },
};

export default param;
