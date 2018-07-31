const defaultMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isSafeYear = (number) => {
  const isValid = Number.isInteger(number) && (number > 1900) && (number < 5001);
  return isValid;
};

const isSafeMonth = (number) => {
  const isValid = Number.isInteger(number) && (number >= 0) && (number < 12);
  return isValid;
};

class CustomDate {
  constructor(date) {
    if (!date || !(date instanceof Date)) throw new TypeError('参数应是一个Date实例对象');
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = date.getDate();
    return this;
  }
  backOneMonth() {
    // 月份 -1
    this.month -= 1;
    if (this.month < 0) {
      this.year -= 1;
      this.month = 11;
    }
    return this;
  }
  aheadOneMonth() {
    // 月份 +1
    this.month += 1;
    if (this.month > 11) {
      this.year += 1;
      this.month = 0;
    }
    return this;
  }
  toDate() {
    const result = new Date(this.year, this.month, this.day);
    return result;
  }
  static of(date) {
    return new CustomDate(date);
  }
  reset(date) {
    // 重设日期
    const result = CustomDate.of(date);
    if (!result) throw new TypeError('哪里出现了问题');
    this.year = result.year;
    this.month = result.month;
    this.day = result.day;
    return this;
  }
  static getMonths(yearNumber) {
    // 用一个数组表示某一年的12月每月有多少天
    if (!isSafeYear(yearNumber)) throw new TypeError('参数应该是一个数字，有效值1901-5000');
    const months = defaultMonths;
    const isLeapYear = (yearNumber % 4 === 0);
    if (isLeapYear) months[1] = 29;
    return months;
  }

  static getDaysCount(year, month) {
    // 获得某一个月的天数
    if (!isSafeYear(year)) throw new TypeError('参数应该是一个数字，有效值1901-5000');
    if (!isSafeMonth(month)) throw new TypeError('参数应该是一个数字，有效值0-11');
    const months = CustomDate.getMonths(year);
    const count = months[month];
    return count;
  }
  static getWeekArray(date) {
    // 用数组形式表示一周，从周一开始 [30, 1, 2, 3, 4, 5, 6]
    if (!(date instanceof Date)) throw new TypeError('参数应该是一个Date实例对象');
    const week = [];
    const daysCount = CustomDate.getDaysCount(date.getFullYear(), date.getMonth());
    const prevThe1st = new Date(date.getFullYear(), (date.getMonth() - 1), 1);
    const prevDaysCount = CustomDate.getDaysCount(prevThe1st.getFullYear(), prevThe1st.getMonth());
    const weekStart = date.getDate() - date.getDay();
    for (let i = 0; i < 7; i += 1) {
      let dayNum = weekStart + i;
      if (dayNum > daysCount) {
        dayNum -= daysCount;
      } else if (dayNum < 1) {
        dayNum += prevDaysCount;
      }
      week.push(dayNum);
    }
    return week;
  }
  static getMonthArray(date) {
    // 用数组形式表示一个月 [[30, 1, 2, 3, 4, 5, 6], [7,8,9,10,11,12,13], ...]
    if (!date || !(date instanceof Date)) throw new TypeError('参数应该是一个Date实例对象');
    const month = [];
    const daysCount = CustomDate.getDaysCount(date.getFullYear(), date.getMonth());
    const thisWeek = CustomDate.getWeekArray(date);
    month.push(thisWeek);
    for (let i = 0; i < 5; i += 1) {
      const prevSaturday = (date.getDate() - date.getDay()) - 1 - (i * 7);
      if (prevSaturday > 0) {
        const prevSaturdayDate = new Date(date.getFullYear(), date.getMonth(), prevSaturday);
        const prevWeek = CustomDate.getWeekArray(prevSaturdayDate);
        month.unshift(prevWeek);
      }
      const nextSunday = (date.getDate() - date.getDay()) + 7 + (i * 7);
      if (nextSunday <= daysCount) {
        const nextSundayDate = new Date(date.getFullYear(), date.getMonth(), nextSunday);
        const nextWeek = CustomDate.getWeekArray(nextSundayDate);
        month.push(nextWeek);
      }
    }
    return month;
  }
}

export default CustomDate;
