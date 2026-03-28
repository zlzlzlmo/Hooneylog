import { notionMockData } from 'mocks/notionData';
import NotionCategory from '../../category/notionCategory/notionCategory';

describe('category list', () => {
  test('get notion category list list for getting proper orderedListByDescendingCount', () => {
    expect(new NotionCategory(notionMockData).orderedListByDescendingCount).toEqual([
      ['전체', 32],
      ['알고리즘', 10],
      ['typescript', 7],
      ['nest.js', 4],
      ['javascript', 2],
      ['next.js', 2],
      ['react', 2],
      ['refactoring', 2],
      ['최적화', 1],
      ['css', 1],
      ['esbuild', 1],
    ]);
  });
});
