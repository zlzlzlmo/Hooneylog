import { RichTextItemResponse } from '@hooneylog/shared-types';

interface NotionBlockTextProps {
  richText: RichTextItemResponse[];
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
          plain_text,
          href,
        } = value;

        const classes = [
          bold ? 'font-bold' : '',
          italic ? 'italic' : '',
          strikethrough ? 'line-through' : '',
          underline ? 'underline' : '',
          code ? 'bg-gray-100 text-sub px-1 py-0.5 rounded font-mono text-[0.9em]' : '',
        ].filter(Boolean).join(' ');

        const style = color !== 'default' ? { color } : {};

        if (href) {
          return (
            <a 
              key={index} 
              href={href} 
              className={`${classes} text-sub hover:underline`}
              style={style}
              target="_blank"
              rel="noopener noreferrer"
            >
              {plain_text}
            </a>
          );
        }

        return (
          <span key={index} className={classes} style={style}>
            {plain_text}
          </span>
        );
      })}
    </>
  );
}
