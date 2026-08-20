import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import { Mermaid } from '@/components/elements/mermaid';
import { CodeBlock } from './code-block';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Final client-side cleanup for markdown strings.
 * This handles any remaining over-escaping that might have bypassed server-side filters or caches.
 */
function finalCleanup(md: string): string {
  if (!md) return md;
  let result = md;
  let previous;

  // Recursive unescape to handle multiple layers of backslashes
  do {
    previous = result;
    // eslint-disable-next-line no-useless-escape
    result = result.replace(/\\([*|_~`\[\]()#+!.-])/g, '$1');
  } while (result !== previous);

  return result;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const cleanContent = finalCleanup(content);

  return (
    <div className="prose prose-notion max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec((className as string) || '');
            const language = match?.[1] ?? '';

            // 💡 Mermaid 다이어그램 처리
            if (language === 'mermaid') {
              return <Mermaid content={String(children).replace(/\n$/, '')} />;
            }

            return !inline && match ? (
              <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
            ) : (
              <code
                className="bg-notion-gray-bg text-notion-text border border-notion-border px-1 py-0.5 rounded-[3px] text-[0.85em] font-mono break-words"
                {...props}
              >
                {children as React.ReactNode}
              </code>
            );
          },
          // Customizing specific tags to look like Notion
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          div({ className, children, ...props }: any) {
            if (className === 'notion-callout') {
              return (
                <div
                  className="flex gap-4 p-4 my-4 bg-notion-gray-bg/50 border border-notion-border rounded-[4px] items-start"
                  {...props}
                >
                  {children as React.ReactNode}
                </div>
              );
            }
            if (className === 'notion-callout-icon') {
              return (
                <div className="text-[20px] leading-none select-none" {...props}>
                  {children as React.ReactNode}
                </div>
              );
            }
            if (className === 'notion-callout-content') {
              return (
                <div className="text-[16px] leading-[1.5] text-notion-text flex-1" {...props}>
                  {children as React.ReactNode}
                </div>
              );
            }
            return (
              <div className={className as string} {...props}>
                {children as React.ReactNode}
              </div>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          li({ children, checked, ...props }: any) {
            // Handle To-do list (Checkbox)
            if (typeof checked === 'boolean') {
              return (
                <li className="flex items-start gap-2 list-none -ml-6 mb-1 group" {...props}>
                  <div className="flex items-center justify-center w-[18px] h-[18px] mt-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="w-4 h-4 rounded-[2px] border-2 border-notion-text accent-notion-text cursor-pointer"
                    />
                  </div>
                  <span
                    className={`text-[16px] leading-[1.6] ${checked ? 'text-notion-secondary line-through' : 'text-notion-text'}`}
                  >
                    {children as React.ReactNode}
                  </span>
                </li>
              );
            }
            return (
              <li className="text-[16px] leading-[1.6] text-notion-text" {...props}>
                {children as React.ReactNode}
              </li>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a({ children, ...props }: any) {
            return (
              <a
                className="text-accent underline decoration-accent/40 underline-offset-[3px] hover:decoration-accent transition-colors break-all"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children as React.ReactNode}
              </a>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h1({ id, children, ...props }: any) {
            return (
              <h1
                id={id as string}
                className="text-[30px] font-extrabold tracking-[-0.02em] mt-[2em] mb-[0.5em] leading-[1.2] text-notion-text break-keep"
                {...props}
              >
                {children as React.ReactNode}
              </h1>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h2({ id, children, ...props }: any) {
            return (
              <h2
                id={id as string}
                className="group/anchor text-[24px] font-bold tracking-[-0.01em] mt-[2em] mb-[0.4em] leading-[1.3] text-notion-text scroll-mt-[72px] break-keep"
                {...props}
              >
                {children as React.ReactNode}
                {id && (
                  <a
                    href={`#${id}`}
                    aria-label="이 섹션 링크"
                    className="ml-2 font-mono text-[0.75em] text-accent opacity-0 group-hover/anchor:opacity-100 transition-opacity no-underline"
                  >
                    #
                  </a>
                )}
              </h2>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h3({ id, children, ...props }: any) {
            return (
              <h3
                id={id as string}
                className="group/anchor text-[20px] font-bold tracking-[-0.01em] mt-[1.6em] mb-[0.3em] leading-[1.3] text-notion-text scroll-mt-[72px] break-keep"
                {...props}
              >
                {children as React.ReactNode}
                {id && (
                  <a
                    href={`#${id}`}
                    aria-label="이 섹션 링크"
                    className="ml-2 font-mono text-[0.75em] text-accent opacity-0 group-hover/anchor:opacity-100 transition-opacity no-underline"
                  >
                    #
                  </a>
                )}
              </h3>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          p({ children, ...props }: any) {
            return (
              <p
                className="text-[16px] leading-[1.6] mb-[0.8em] break-keep min-h-[24px] text-notion-text"
                {...props}
              >
                {children as React.ReactNode}
              </p>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ul({ children, ...props }: any) {
            return (
              <ul className="pl-[24px] list-disc mt-1 space-y-1 mb-4" {...props}>
                {children as React.ReactNode}
              </ul>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ol({ children, ...props }: any) {
            return (
              <ol className="pl-[24px] list-decimal mt-1 space-y-1 mb-4" {...props}>
                {children as React.ReactNode}
              </ol>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          blockquote({ children, ...props }: any) {
            return (
              <blockquote
                className="border-l-2 border-notion-border pl-[16px] py-[2px] my-[1.4em] text-[16px] leading-[1.6] text-notion-secondary italic"
                {...props}
              >
                {children as React.ReactNode}
              </blockquote>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img({ src, alt, ...props }: any) {
            return (
              <figure className="my-6 flex flex-col items-start w-full">
                <div className="w-full max-h-[70vh] aspect-[16/10] overflow-hidden rounded-[4px] bg-notion-gray-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src as string}
                    alt={(alt as string) || ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                    {...props}
                  />
                </div>
                {alt && (
                  <figcaption className="mt-2 text-[14px] text-notion-secondary">
                    {alt as React.ReactNode}
                  </figcaption>
                )}
              </figure>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hr({ ...props }: any) {
            return (
              <hr className="w-full h-[1px] bg-notion-border border-none my-[2em]" {...props} />
            );
          },
          // Notion-style Table Customization
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table({ children, ...props }: any) {
            return (
              <div className="my-6 overflow-x-auto">
                <table
                  className="w-full border-collapse border border-notion-border text-[14px]"
                  {...props}
                >
                  {children as React.ReactNode}
                </table>
              </div>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thead({ children, ...props }: any) {
            return (
              <thead className="bg-notion-gray-bg" {...props}>
                {children as React.ReactNode}
              </thead>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          th({ children, ...props }: any) {
            return (
              <th
                className="border border-notion-border px-4 py-2.5 text-left font-mono text-[12px] font-semibold text-notion-secondary uppercase tracking-[0.1em]"
                {...props}
              >
                {children as React.ReactNode}
              </th>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          td({ children, ...props }: any) {
            return (
              <td className="border border-notion-border px-4 py-2 text-notion-text" {...props}>
                {children as React.ReactNode}
              </td>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
