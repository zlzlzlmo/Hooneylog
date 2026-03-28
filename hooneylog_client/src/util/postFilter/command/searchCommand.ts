/* eslint-disable import/no-unresolved */
import { NotionPost } from 'services/notion/notionApi';
import { ICommand } from '../filterCommand';

class SearchCommand implements ICommand {
  constructor(private readonly searchValue: string) {}

  execute(notionList: NotionPost[]) {
    if (this.searchValue.length < 1) return notionList;
    const result = notionList.filter(({ title, description }) => {
      return this.isIncludedTitle(title) || this.isIncludedDescription(description);
    });
    return result;
  }

  private isIncludedTitle(title: string): boolean {
    const value = this.searchValue;
    if (!value) return false;
    return title.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  private isIncludedDescription(description: string): boolean {
    const value = this.searchValue;
    if (!value) return false;
    return description.toLowerCase().indexOf(value) !== -1;
  }
}

export default SearchCommand;
