import { NotionPost } from 'services/notion/notionApi';
import { useMemo, useState } from 'react';
import { ALL } from 'util/category/category';
import CategoryCommand from 'util/postFilter/command/categoryCommand';
import SearchCommand from 'util/postFilter/command/searchCommand';
import FilterCommand from 'util/postFilter/filterCommand';

interface Props {
  notionList: NotionPost[];
}

const useFilterPost = ({ notionList }: Props) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentActiveCategory, setCurrentActiveCategory] = useState<string>(ALL);

  const handleSearchValue = (text: string) => {
    setSearchValue(text);
  };

  const handleCurrentActiveCategory = (cate: string) => {
    setCurrentActiveCategory(cate);
  };

  const filteredNotionList = useMemo(() => {
    let result = [...notionList];
    const filter = new FilterCommand(notionList);
    result = filter.excuteCommand(new SearchCommand(searchValue));
    result = filter.excuteCommand(new CategoryCommand(currentActiveCategory));
    return result;
  }, [searchValue, currentActiveCategory]);

  return { searchValue, currentActiveCategory, handleSearchValue, handleCurrentActiveCategory, filteredNotionList };
};

export default useFilterPost;
