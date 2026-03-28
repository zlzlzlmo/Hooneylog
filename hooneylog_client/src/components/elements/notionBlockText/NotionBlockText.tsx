import React from 'react';
import styles from './NotionBlockText.module.scss';

interface NotionBlockTextProps {
  richText: [
    {
      text: {
        content: string;
        link: {
          url: string;
        };
      };
      annotations: {
        bold: boolean;
        code: boolean;
        color: string;
        italic: boolean;
        strikethrough: boolean;
        underline: boolean;
      };
    },
  ];
}

const NotionBlockText = ({ richText }: NotionBlockTextProps) => {
  if (!richText) {
    return <span />;
  }
  return (
    <>
      {richText.map((value, index: number) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = value;
        return (
          <span
            key={index}
            className={[
              styles.span,
              bold ? styles.bold : '',
              code ? styles.code : '',
              italic ? styles.italic : '',
              strikethrough ? styles.strikethrough : '',
              underline ? styles.underline : '',
            ].join(' ')}
            style={color !== 'default' ? { color } : {}}
          >
            {text.link ? (
              <a className={styles.anchor} href={text.link.url}>
                {text.content}
              </a>
            ) : (
              text.content
            )}
          </span>
        );
      })}
    </>
  );
};

export default NotionBlockText;
