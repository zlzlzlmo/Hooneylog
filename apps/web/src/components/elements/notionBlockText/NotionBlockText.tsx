interface NotionBlockTextProps {
  richText: {
    text: {
      content: string;
      link: {
        url: string;
      } | null;
    };
    annotations: {
      bold: boolean;
      code: boolean;
      color: string;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
    };
  }[];
}

export function NotionBlockText({ richText }: NotionBlockTextProps) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return (
    <>
      {richText.map((value, index) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = value;

        const classes = [
          bold ? 'font-bold' : '',
          italic ? 'italic' : '',
          strikethrough ? 'line-through' : '',
          underline ? 'underline' : '',
          code ? 'bg-gray-100 text-sub px-1 py-0.5 rounded font-mono text-[0.9em]' : '',
        ].filter(Boolean).join(' ');

        const style = color !== 'default' ? { color } : {};

        if (text.link) {
          return (
            <a 
              key={index} 
              href={text.link.url} 
              className={`${classes} text-sub hover:underline`}
              style={style}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.content}
            </a>
          );
        }

        return (
          <span key={index} className={classes} style={style}>
            {text.content}
          </span>
        );
      })}
    </>
  );
}
