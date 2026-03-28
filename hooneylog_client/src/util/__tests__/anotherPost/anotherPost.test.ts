import { notionMockData } from 'mocks/notionData';
import createAnotherPost from '../../anotherPost/createAnotherPost';

describe('show another post', () => {
  test('show a proper previos post', () => {
    const previos = createAnotherPost({ type: 'previos', notionList: notionMockData, currentPost: notionMockData[1] });
    expect(previos.getPost()).toBe(notionMockData[0]);
  });

  test('show a proper next post', () => {
    const next = createAnotherPost({ type: 'next', notionList: notionMockData, currentPost: notionMockData[3] });
    expect(next.getPost()).toBe(notionMockData[4]);
  });
});
