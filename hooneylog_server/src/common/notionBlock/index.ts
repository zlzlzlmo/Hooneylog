import { INotionProperties } from 'src/common/interface';

class NotionBlock {
  private readonly properties;

  constructor(properties: INotionProperties) {
    this.properties = properties;
  }

  get title() {
    return this.properties.이름.title[0].plain_text;
  }

  get createdAt() {
    return this.properties.created_date.created_time;
  }

  get category() {
    return this.properties.category.multi_select[0].name;
  }

  get tags() {
    return this.properties.tag.multi_select;
  }

  get description() {
    return this.properties.description.rich_text[0].plain_text;
  }
}

export default NotionBlock;
