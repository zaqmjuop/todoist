import Dom from '../dom';

const param = {
  query: 'mission-list-item',
  url: './assets/components/missionListItem.html',
  selectors: {
    content: '.item-content',
    date: '.item-date',
  },
  created() {
    console.log('mission-lisi-item', this);
    Dom.of(this.elements.content).attr('text', this.present.content);
    Dom.of(this.elements.date).attr('text', this.present.date);
    Dom.of(this.elements.template).attr('id', this.present.id);
  },
};

export default param;
