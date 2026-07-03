import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyButton } from './copy-button';

// Server Component: the syntax highlighting is fully deterministic and rendered
// on the server, so react-syntax-highlighter never ships to the client bundle.
// Only the copy button (CopyButton) is a small 'use client' island.
export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="group/code relative my-[1.2em] text-[14px] rounded-[3px] overflow-hidden border border-notion-border font-mono">
      <CopyButton code={code} />
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
