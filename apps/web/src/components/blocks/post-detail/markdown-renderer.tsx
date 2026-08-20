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

/**
 * Typography comes from @tailwindcss/typography (`prose`), so only the elements
 * that need real behaviour are overridden below: fenced code (highlighting,
 * mermaid), Notion callouts, to-do checkboxes, figures, and heading anchors.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const cleanContent = finalCleanup(content);

  return (
    <div className="prose prose-neutral max-w-none break-keep wrap-anywhere dark:prose-invert prose-headings:scroll-mt-24 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec((className as string) || '');
            const language = match?.[1] ?? '';

            if (language === 'mermaid') {
              return <Mermaid content={String(children).replace(/\n$/, '')} />;
            }

            return !inline && match ? (
              <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
            ) : (
              <code className={className as string} {...props}>
                {children as React.ReactNode}
              </code>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          div({ className, children, ...props }: any) {
            if (className === 'notion-callout') {
              return (
                <div
                  className="not-prose my-6 flex items-start gap-4 rounded-lg border bg-muted/50 p-4"
                  {...props}
                >
                  {children as React.ReactNode}
                </div>
              );
            }
            if (className === 'notion-callout-icon') {
              return (
                <div className="text-xl leading-none select-none" {...props}>
                  {children as React.ReactNode}
                </div>
              );
            }
            if (className === 'notion-callout-content') {
              return (
                <div className="flex-1 leading-relaxed" {...props}>
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
            if (typeof checked === 'boolean') {
              return (
                <li className="flex list-none items-start gap-2 -ml-6" {...props}>
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    aria-hidden="true"
                    tabIndex={-1}
                    className="mt-1.5 size-4 shrink-0 accent-primary"
                  />
                  <span className={checked ? 'text-muted-foreground line-through' : undefined}>
                    {children as React.ReactNode}
                  </span>
                </li>
              );
            }
            return <li {...props}>{children as React.ReactNode}</li>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a({ children, href, ...props }: any) {
            const external = typeof href === 'string' && href.startsWith('http');
            return (
              <a
                href={href as string}
                className="break-all"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...props}
              >
                {children as React.ReactNode}
              </a>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img({ src, alt, ...props }: any) {
            return (
              <figure className="my-6">
                <div className="flex max-h-[70vh] w-full overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src as string}
                    alt={(alt as string) || ''}
                    loading="lazy"
                    decoding="async"
                    className="m-0 h-auto w-full object-contain"
                    {...props}
                  />
                </div>
                {alt && (
                  <figcaption className="mt-2 text-sm text-muted-foreground">
                    {alt as React.ReactNode}
                  </figcaption>
                )}
              </figure>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table({ children, ...props }: any) {
            return (
              <div className="my-6 w-full overflow-x-auto">
                <table {...props}>{children as React.ReactNode}</table>
              </div>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
