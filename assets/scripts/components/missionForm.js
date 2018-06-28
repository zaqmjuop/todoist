import Dom from '../dom';
import missions from '../indexeddb/missions';
import datepicker from '../lib/datepicker';

const param = {
  query: 'mission-form',
  url: './assets/components/missionForm.html',
  selectors: {
    contentInput: 'input[name=content]',
    dateInput: 'input[name=date]',
    cancelForm: '.cancel-form',
  },
  created() {
    datepicker(this.elements.dateInput);
    Dom.of(this.elements.cancelForm).on('click', (event) => {
      // 隐藏form
      event.stopPropagation();
      Dom.of(this.template).addClass('hide');
      this.elements.contentInput.blur();
    });
  },
};

export default param;
