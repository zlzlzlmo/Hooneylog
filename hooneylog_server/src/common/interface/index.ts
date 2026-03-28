export interface INotionImage {
  files: [{ name: string; file?: { url: string }; external?: { url: string } }];
}
export interface INotionProperties {
  category: {
    multi_select: [{ name: string }];
  };
  tag: {
    multi_select: [{ id: string; name: string }];
  };
  created_date: {
    created_time: string;
  };
  description: {
    rich_text: [
      {
        plain_text: string;
      },
    ];
  };

  image: INotionImage;

  slug: {
    rich_text: [{ plain_text: string }];
  };

  이름: {
    title: [{ plain_text: string }];
  };
}

export interface INotionPost {
  id: string;
  properties: INotionProperties;
  results: object[];
}
