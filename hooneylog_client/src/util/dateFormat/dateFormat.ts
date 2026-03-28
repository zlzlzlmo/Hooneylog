import { DateTimeFormatOptions } from './date-interface';

class DateFormat {
  date: Date;

  constructor(postDate: string) {
    this.date = new Date(postDate);
  }

  getKoreaTime() {
    const options: DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };

    return this.date.toLocaleDateString('ko-KR', options);
  }
}

export default DateFormat;
