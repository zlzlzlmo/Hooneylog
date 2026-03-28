import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-notion max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="my-[4px] text-[14px] rounded-[3px] overflow-hidden bg-[#F7F6F3] p-8 border border-notion-border font-mono">
                <SyntaxHighlighter
                  language={match[1]}
                  useInlineStyles={false}
                  className="code-highlighter !bg-transparent !p-0 !m-0 overflow-x-auto"
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 text-[#EB5757] px-1.5 py-0.5 rounded-[3px] text-[0.9em] font-mono break-words" {...props}>
                {children}
              </code>
            );
          },
          // Customizing specific tags to look like Notion
          a({ node, children, ...props }: any) {
            return (
              <a className="text-notion-text underline decoration-notion-border underline-offset-4 hover:opacity-80 transition-opacity break-all" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          h1({ node, children, ...props }: any) {
            return <h1 className="text-[30px] font-bold mt-[2em] mb-[4px] leading-[1.3] text-notion-text" {...props}>{children}</h1>;
          },
          h2({ node, children, ...props }: any) {
            return <h2 className="text-[24px] font-semibold mt-[1.4em] mb-[1px] leading-[1.3] text-notion-text" {...props}>{children}</h2>;
          },
          h3({ node, children, ...props }: any) {
            return <h3 className="text-[20px] font-semibold mt-[1em] mb-[1px] leading-[1.3] text-notion-text" {...props}>{children}</h3>;
          },
          p({ node, children, ...props }: any) {
            return <p className="text-[16px] leading-[1.6] mb-[2px] break-keep min-h-[24px] text-notion-text" {...props}>{children}</p>;
          },
          ul({ node, children, ...props }: any) {
            return <ul className="pl-[24px] list-disc mt-1 space-y-1 mb-4" {...props}>{children}</ul>;
          },
          ol({ node, children, ...props }: any) {
            return <ol className="pl-[24px] list-decimal mt-1 space-y-1 mb-4" {...props}>{children}</ol>;
          },
          li({ node, children, ...props }: any) {
            return <li className="text-[16px] leading-[1.6] text-notion-text" {...props}>{children}</li>;
          },
          blockquote({ node, children, ...props }: any) {
            return (
              <blockquote className="border-l-[3px] border-notion-text pl-[14px] py-[2px] my-[12px] text-[16px] leading-[1.5] text-notion-text italic" {...props}>
                {children}
              </blockquote>
            );
          },
          img({ node, src, alt, ...props }: any) {
            return (
              <figure className="my-6 flex flex-col items-start w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={src} 
                  alt={alt || 'image'} 
                  className="max-w-full rounded-[4px] object-contain max-h-[70vh]"
                  {...props}
                />
                {alt && <figcaption className="mt-2 text-[14px] text-notion-secondary">{alt}</figcaption>}
              </figure>
            );
          },
          hr({ node, ...props }: any) {
            return <hr className="w-full h-[1px] bg-notion-border border-none my-[16px]" {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
