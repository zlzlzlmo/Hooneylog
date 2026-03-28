import { useState, useMemo } from 'react';
import { NotionPost } from '@hooneylog/shared-types';
import { ALL } from '@/utils/category';

export function useFilterPost(posts: NotionPost[]) {
  const [searchValue, setSearchValue] = useState('');
  const [currentActiveCategory, setCurrentActiveCategory] = useState(ALL);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 카테고리 필터
      const matchCategory = currentActiveCategory === ALL || post.category === currentActiveCategory;
      // 검색 필터 (제목 또는 설명)
      const matchSearch = post.title.toLowerCase().includes(searchValue.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchValue.toLowerCase());
      
      return matchCategory && matchSearch;
    });
  }, [posts, searchValue, currentActiveCategory]);

  return {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts,
  };
}
