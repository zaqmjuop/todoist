import Dom from '../dom';

const param = {
  query: 'mission-list-item',
  url: './assets/components/missionListItem.html',
  selectors: {
    content: '.item-content',
    date: '.item-date',
    done: '.done',
  },
  created() {
    Dom.of(this.elements.content).attr('text', this.present.content);
    Dom.of(this.elements.date).attr('text', this.present.date);
    Dom.of(this.elements.template).attr('id', `item-${this.present.id}`);
    Dom.of(this.elements.done).on('click', () => {
      Dom.of(this.template).selfDestruct();
    });
  },
};

export default param;
