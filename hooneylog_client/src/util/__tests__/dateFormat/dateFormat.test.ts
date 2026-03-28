import DateFormat from '../../dateFormat/dateFormat';

describe('dateFormat', () => {
  test('get Korean Time from a date string', () => {
    expect(new DateFormat('2022-04-21 14:30').getKoreaTime()).toBe('2022년 4월 21일 14:30');
  });
});
