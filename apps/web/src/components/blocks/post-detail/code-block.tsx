import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyButton } from './copy-button';

// Server Component: the syntax highlighting is fully deterministic and rendered
// on the server, so react-syntax-highlighter never ships to the client bundle.
// Only the copy button (CopyButton) is a small 'use client' island.
export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border text-sm">
      <div className="flex h-9 items-center justify-between gap-2 border-b bg-muted pr-1.5 pl-3">
        {language ? (
          <span className="truncate text-xs tracking-wider text-muted-foreground uppercase">
            {language}
          </span>
        ) : (
          <span />
        )}
        <CopyButton code={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="code-highlighter !m-0 !p-5 overflow-x-auto"
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
