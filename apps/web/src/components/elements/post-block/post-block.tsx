import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { BlockObjectResponse } from '@hooneylog/shared-types';
import { NotionBlockText } from '../notion-block-text/notion-block-text';
import { Mermaid } from '../mermaid';

const BlockNestedList = ({ block }: { block: BlockObjectResponse }) => {
  if (!('has_children' in block) || !block.has_children) return null;
  
  // Note: Notion API doesn't return children in the list call, 
  // you usually need to fetch them separately or they might be added by a mapper.
  // In the current implementation, children are not pre-fetched for nested lists.
  // This is a known limitation of the current getBlocksById implementation.
  return null;
};

export function PostBlock({ block }: { block: BlockObjectResponse }) {
  const { type } = block;

  switch (type) {
    case 'paragraph':
      return (
        <p className="text-[16px] leading-[1.6] mb-[2px] break-keep min-h-[24px] text-notion-text">
          <NotionBlockText richText={block.paragraph.rich_text} />
        </p>
      );
      
    case 'heading_1':
      return (
        <h1 className="text-[30px] font-bold mt-[2em] mb-[4px] leading-[1.3] text-notion-text">
          <NotionBlockText richText={block.heading_1.rich_text} />
        </h1>
      );
      
    case 'heading_2':
      return (
        <h2 className="text-[24px] font-semibold mt-[1.4em] mb-[1px] leading-[1.3] text-notion-text">
          <NotionBlockText richText={block.heading_2.rich_text} />
        </h2>
      );
      
    case 'heading_3':
      return (
        <h3 className="text-[20px] font-semibold mt-[1em] mb-[1px] leading-[1.3] text-notion-text">
          <NotionBlockText richText={block.heading_3.rich_text} />
        </h3>
      );
      
    case 'bulleted_list_item':
      return (
        <li className="text-[16px] leading-[1.6] list-disc ml-[24px] mb-[2px] text-notion-text">
          <NotionBlockText richText={block.bulleted_list_item.rich_text} />
          <BlockNestedList block={block} />
        </li>
      );

    case 'numbered_list_item':
      return (
        <li className="text-[16px] leading-[1.6] list-disc ml-[24px] mb-[2px] text-notion-text">
          <NotionBlockText richText={block.numbered_list_item.rich_text} />
          <BlockNestedList block={block} />
        </li>
      );
      
    case 'toggle':
      return (
        <details className="mb-[2px] text-[16px] text-notion-text group">
          <summary className="cursor-pointer list-none flex items-start outline-none hover:bg-notion-hover rounded-[3px] p-[2px] transition-colors -ml-[2px]">
            <div className="w-[24px] h-[24px] flex items-center justify-center flex-shrink-0 transition-transform group-open:rotate-90">
              <svg viewBox="0 0 100 100" className="w-[10px] h-[10px] fill-notion-secondary"><polygon points="5.9,88.2 5.9,11.8 81.1,50"></polygon></svg>
            </div>
            <div className="flex-1 leading-[1.5]">
              <NotionBlockText richText={block.toggle.rich_text} />
            </div>
          </summary>
          {/* Note: Children fetching logic needed here if toggles should show content */}
        </details>
      );
      
    case 'image': {
      const value = block.image;
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption && value.caption.length > 0 ? value.caption[0]?.plain_text : '';
      return (
        <figure className="my-3 flex flex-col items-start w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={caption || 'image'} 
            className="max-w-full rounded-[4px] border border-notion-border object-contain max-h-[70vh]"
          />
          {caption && <figcaption className="mt-2 text-[14px] text-notion-secondary">{caption}</figcaption>}
        </figure>
      );
    }
      
    case 'divider':
      return <hr className="w-full h-[1px] bg-notion-border border-none my-[16px]" />;
      
    case 'quote':
      return (
        <blockquote className="border-l-[3px] border-notion-text pl-[14px] py-[2px] my-[4px] text-[16px] leading-[1.5] text-notion-text">
          <NotionBlockText richText={block.quote.rich_text} />
        </blockquote>
      );
      
    case 'code': {
      const language = block.code.language || 'typescript';
      const content = block.code.rich_text[0]?.plain_text || '';

      if (language === 'mermaid') {
        return <Mermaid content={content} />;
      }

      return (
        <div className="my-[4px] text-[14px] rounded-[3px] overflow-hidden border border-notion-border font-mono">
          <SyntaxHighlighter 
            language={language}
            style={vscDarkPlus}
            className="code-highlighter !m-0 !p-6 overflow-x-auto"
          >
            {content}
          </SyntaxHighlighter>
        </div>
      );
    }
      
    case 'bookmark': {
      const href = block.bookmark.url;
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center border border-notion-border rounded-[3px] hover:bg-notion-hover transition-colors overflow-hidden my-[4px] no-underline h-[118px]"
        >
          <div className="flex flex-col p-[14px] flex-1 min-w-0 justify-between h-full">
             <div className="text-[14px] text-notion-text line-clamp-1 mb-[2px]">{href}</div>
             <div className="text-[12px] text-notion-secondary line-clamp-2 mb-[6px]">{href}</div>
             <div className="text-[12px] text-notion-text line-clamp-1 flex items-center gap-2">
               🔗 {new URL(href).hostname}
             </div>
          </div>
        </a>
      );
    }
      
    default:
      // Silently ignore unsupported blocks or render a tiny placeholder
      return null;
  }
}
