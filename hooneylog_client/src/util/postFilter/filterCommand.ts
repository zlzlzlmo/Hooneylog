import { NotionPost } from 'services/notion/notionApi';

export interface ICommand {
  execute: (notionList: NotionPost[]) => NotionPost[];
}

class FilterCommand {
  constructor(private notionList: NotionPost[]) {}

  excuteCommand(command: ICommand) {
    this.notionList = command.execute(this.notionList);
    return this.notionList;
  }
}

export default FilterCommand;
