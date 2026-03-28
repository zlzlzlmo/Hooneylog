import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-notion max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ _node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec((className as string) || '');
            return !inline && match ? (
              <div className="my-[4px] text-[14px] rounded-[3px] overflow-hidden bg-[#F7F6F3] p-8 border border-notion-border font-mono">
                <SyntaxHighlighter
                  language={match[1] as string}
                  useInlineStyles={false}
                  className="code-highlighter !bg-transparent !p-0 !m-0 overflow-x-auto"
                  PreTag="div"
                  {...(props as any)}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 text-[#EB5757] px-1.5 py-0.5 rounded-[3px] text-[0.9em] font-mono break-words" {...(props as any)}>
                {children as React.ReactNode}
              </code>
            );
          },
          // Customizing specific tags to look like Notion
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          div({ _node, className, children, ...props }: any) {
            if (className === 'notion-callout') {
              return (
                <div className="flex gap-4 p-4 my-4 bg-notion-gray-bg/50 border border-notion-border rounded-[4px] items-start" {...(props as any)}>
                  {children as React.ReactNode}
                </div>
              );
            }
            if (className === 'notion-callout-icon') {
              return <div className="text-[20px] leading-none select-none" {...(props as any)}>{children as React.ReactNode}</div>;
            }
            if (className === 'notion-callout-content') {
              return <div className="text-[16px] leading-[1.5] text-notion-text flex-1" {...(props as any)}>{children as React.ReactNode}</div>;
            }
            return <div className={className as string} {...(props as any)}>{children as React.ReactNode}</div>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          li({ _node, children, checked, ...props }: any) {
            // Handle To-do list (Checkbox)
            if (typeof checked === 'boolean') {
              return (
                <li className="flex items-start gap-2 list-none -ml-6 mb-1 group" {...(props as any)}>
                  <div className="flex items-center justify-center w-[18px] h-[18px] mt-1 flex-shrink-0">
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      readOnly
                      className="w-4 h-4 rounded-[2px] border-2 border-notion-text accent-notion-text cursor-pointer"
                    />
                  </div>
                  <span className={`text-[16px] leading-[1.6] ${checked ? 'text-notion-secondary line-through' : 'text-notion-text'}`}>
                    {children as React.ReactNode}
                  </span>
                </li>
              );
            }
            return <li className="text-[16px] leading-[1.6] text-notion-text" {...(props as any)}>{children as React.ReactNode}</li>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a({ _node, children, ...props }: any) {
            return (
              <a className="text-notion-text underline decoration-notion-border underline-offset-4 hover:opacity-80 transition-opacity break-all" target="_blank" rel="noopener noreferrer" {...(props as any)}>
                {children as React.ReactNode}
              </a>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h1({ _node, children, ...props }: any) {
            return <h1 className="text-[30px] font-bold mt-[2em] mb-[4px] leading-[1.3] text-notion-text" {...(props as any)}>{children as React.ReactNode}</h1>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h2({ _node, children, ...props }: any) {
            return <h2 className="text-[24px] font-semibold mt-[1.4em] mb-[1px] leading-[1.3] text-notion-text" {...(props as any)}>{children as React.ReactNode}</h2>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h3({ _node, children, ...props }: any) {
            return <h3 className="text-[20px] font-semibold mt-[1em] mb-[1px] leading-[1.3] text-notion-text" {...(props as any)}>{children as React.ReactNode}</h3>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          p({ _node, children, ...props }: any) {
            return <p className="text-[16px] leading-[1.6] mb-[2px] break-keep min-h-[24px] text-notion-text" {...(props as any)}>{children as React.ReactNode}</p>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ul({ _node, children, ...props }: any) {
            return <ul className="pl-[24px] list-disc mt-1 space-y-1 mb-4" {...(props as any)}>{children as React.ReactNode}</ul>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ol({ _node, children, ...props }: any) {
            return <ol className="pl-[24px] list-decimal mt-1 space-y-1 mb-4" {...(props as any)}>{children as React.ReactNode}</ol>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          blockquote({ _node, children, ...props }: any) {
            return (
              <blockquote className="border-l-[3px] border-notion-text pl-[14px] py-[2px] my-[12px] text-[16px] leading-[1.5] text-notion-text italic" {...(props as any)}>
                {children as React.ReactNode}
              </blockquote>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img({ _node, src, alt, ...props }: any) {
            return (
              <figure className="my-6 flex flex-col items-start w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={src as string} 
                  alt={(alt as string) || 'image'} 
                  className="max-w-full rounded-[4px] object-contain max-h-[70vh]"
                  {...(props as any)}
                />
                {alt && <figcaption className="mt-2 text-[14px] text-notion-secondary">{alt as React.ReactNode}</figcaption>}
              </figure>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hr({ _node, ...props }: any) {
            return <hr className="w-full h-[1px] bg-notion-border border-none my-[16px]" {...(props as any)} />;
          },
          // Notion-style Table Customization
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table({ _node, children, ...props }: any) {
            return (
              <div className="my-6 overflow-x-auto">
                <table className="w-full border-collapse border border-notion-border text-[14px]" {...(props as any)}>
                  {children as React.ReactNode}
                </table>
              </div>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thead({ _node, children, ...props }: any) {
            return <thead className="bg-[#F7F6F3]" {...(props as any)}>{children as React.ReactNode}</thead>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          th({ _node, children, ...props }: any) {
            return (
              <th className="border border-notion-border px-4 py-2 text-left font-semibold text-notion-secondary uppercase tracking-wider" {...(props as any)}>
                {children as React.ReactNode}
              </th>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          td({ _node, children, ...props }: any) {
            return (
              <td className="border border-notion-border px-4 py-2 text-notion-text" {...(props as any)}>
                {children as React.ReactNode}
              </td>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
