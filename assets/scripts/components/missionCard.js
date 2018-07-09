import missionForm from './missionForm';
import Component from './component';
import Dom from '../dom';

const now = new Date();
const dayMark = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 两个日期相差几日 返回值是一个整数 1代表dateb是datea的后一天 -1代表dateb是datea的前一天 0代表是同一天
const differDay = (datea, dateb) => {
  const dateaStart = new Date(datea.toLocaleDateString());
  const datebStart = new Date(dateb.toLocaleDateString());
  const msecs = datebStart.getTime() - dateaStart.getTime();
  const days = msecs / 86400000;
  return days;
};

const param = {
  query: 'mission-card',
  url: './assets/components/missionCard.html',
  data() {
    return {};
  },
  selectors: {
    form: 'mission-form',
    cardHeader: '.card-header',
    dayMark: '.day-mark',
    dateMark: '.date-mark',
    showForm: '.show-form',
  },
  children: {
    missionForm,
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      // Component.pjaxCreate(missionForm);
      this.data.now = now;
      if (this.present.date) {
        this.data.date = this.present.date;
        this.data.dayMark = dayMark[this.data.date.getDay()];
        this.data.dateMark = `${this.data.date.getMonth() + 1}月${this.data.date.getDate()}日`;
        this.data.differDay = differDay(this.data.now, this.data.date);
        if (this.data.differDay === 0) {
          this.data.dayMark = '今天';
        } else if (this.data.differDay === 1) {
          this.data.dayMark = '明天';
        }
        Dom.of(this.elements.dayMark).attr('text', this.data.dayMark);
        Dom.of(this.elements.dateMark).attr('text', this.data.dateMark);
        Dom.of(this.elements.showForm).on('click', () => {
          console.log('showForm')
        });
      }
      this.data.inited = 1;
      return this;
    },
  },
  created() {
    this.methods.init();
    console.log('cardchildren', this.children)
    console.log('card', this.elements.form)
  },
};

export default param;
