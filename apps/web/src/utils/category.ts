import { NotionPost } from '@hooneylog/shared-types';

export const ALL = '전체';

export class CategoryCount {
  private categories: Record<string, number> = {};

  constructor(posts: NotionPost[]) {
    this.categories[ALL] = posts.length;
    
    posts.forEach(post => {
      const category = post.category || '미분류';
      if (this.categories[category]) {
        this.categories[category] += 1;
      } else {
        this.categories[category] = 1;
      }
    });
  }

  get orderedListByDescendingCount(): [string, number][] {
    const list = Object.entries(this.categories);
    // '전체'는 항상 맨 앞에 위치하도록
    const all = list.find(([key]) => key === ALL)!;
    const others = list.filter(([key]) => key !== ALL).sort((a, b) => b[1] - a[1]);
    return [all, ...others];
  }
}
