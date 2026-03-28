import React, { Fragment } from 'react';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { NotionBlockText } from '../notionBlockText/NotionBlockText';

// Recursively render nested lists
const BlockNestedList = (block: any) => {
  if (!block.has_children) return null;
  
  // Note: Nested children rendering requires fetching them first in Notion API. 
  // For simplicity, assuming children are populated or ignoring them if not.
  return (
    <ul className="pl-6 list-disc mt-2 space-y-1">
      {block.children?.map((child: any) => (
        <Fragment key={child.id}>
          <PostBlock block={child} />
        </Fragment>
      ))}
    </ul>
  );
};

export function PostBlock({ block }: { block: any }) {
  const { type, id } = block;
  const value = block[type];

  if (!value) return null;

  switch (type) {
    case 'paragraph':
      return (
        <p className="text-[1.8rem] leading-[1.8] mb-[1.5rem] break-keep font-light">
          <NotionBlockText richText={value.rich_text} />
        </p>
      );
      
    case 'heading_1':
      return (
        <h1 className="text-[4rem] font-bold mt-[5rem] mb-[2rem] leading-tight transition-opacity duration-500">
          <NotionBlockText richText={value.rich_text} />
        </h1>
      );
      
    case 'heading_2':
      return (
        <h2 className="text-[3rem] font-bold mt-[4rem] mb-[1.5rem] leading-tight pb-2 border-b border-gray-200 transition-opacity duration-500">
          <NotionBlockText richText={value.rich_text} />
        </h2>
      );
      
    case 'heading_3':
      return (
        <h3 className="text-[2rem] font-bold mt-[3rem] mb-[1rem] leading-tight">
          <NotionBlockText richText={value.rich_text} />
        </h3>
      );
      
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li className="text-[1.8rem] leading-[1.8] list-disc ml-6 mb-2">
          <NotionBlockText richText={value.rich_text} />
          {BlockNestedList(block)}
        </li>
      );
      
    case 'toggle':
      return (
        <details className="mb-4 bg-gray-50 p-4 rounded-lg">
          <summary className="cursor-pointer text-[1.8rem] font-medium outline-none">
            <NotionBlockText richText={value.rich_text} />
          </summary>
          <div className="mt-4">
            {value.children?.map((child: any) => (
              <Fragment key={child.id}><PostBlock block={child} /></Fragment>
            ))}
          </div>
        </details>
      );
      
    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption && value.caption.length > 0 ? value.caption[0]?.plain_text : '';
      return (
        <figure className="my-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={caption || '블로그 이미지'} 
            className="max-w-full rounded-lg shadow-sm"
          />
          {caption && <figcaption className="mt-2 text-gray-500 text-sm text-center">{caption}</figcaption>}
        </figure>
      );
      
    case 'divider':
      return <hr className="my-10 border-t border-gray-300" />;
      
    case 'quote':
      return (
        <blockquote className="border-l-4 border-sub pl-6 py-2 my-6 bg-gray-50 text-[1.8rem] text-gray-700 italic rounded-r-lg">
          <NotionBlockText richText={value.rich_text} />
        </blockquote>
      );
      
    case 'code':
      return (
        <div className="my-6 text-[1.6rem] rounded-lg overflow-hidden shadow-sm">
          <SyntaxHighlighter language={value.language || 'typescript'}>
            {value.rich_text[0]?.plain_text || ''}
          </SyntaxHighlighter>
        </div>
      );
      
    case 'bookmark':
      const href = value.url;
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block my-4 p-4 border border-gray-200 rounded-lg text-sub hover:bg-gray-50 break-all transition-colors"
        >
          {href}
        </a>
      );
      
    default:
      return (
        <div className="my-4 p-4 bg-red-50 text-red-500 rounded border border-red-200 text-sm">
          ❌ Unsupported block type: {type === 'unsupported' ? 'unsupported by Notion API' : type}
        </div>
      );
  }
}
