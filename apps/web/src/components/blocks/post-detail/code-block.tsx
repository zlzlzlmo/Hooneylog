import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyButton } from './copy-button';

// Server Component: the syntax highlighting is fully deterministic and rendered
// on the server, so react-syntax-highlighter never ships to the client bundle.
// Only the copy button (CopyButton) is a small 'use client' island.
export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="group/code my-[1.2em] text-[14px] rounded-[4px] overflow-hidden border border-notion-border font-mono">
      {/* TRACE terminal top bar: language label (mono) + copy island on the right */}
      <div className="flex items-center justify-between gap-2 h-9 pl-3 pr-1.5 border-b border-notion-border bg-notion-gray-bg">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rotate-45 rounded-[1px] bg-accent"
          />
          {language ? (
            <span className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-notion-secondary">
              {language}
            </span>
          ) : null}
        </div>
        <CopyButton code={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="code-highlighter !m-0 !p-6 overflow-x-auto"
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
