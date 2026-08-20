'use client';

import React, { useEffect, useId, useState } from 'react';
import { Maximize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MermaidProps {
  content: string;
}

// 💡 업계 표준에 부합하는 고급 설정 (Notion/GitHub 스타일)
const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'base' as const, // 커스텀 테마 사용을 위해 base 설정
  securityLevel: 'loose' as const,
  fontFamily: 'Inter, system-ui, sans-serif',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#37352f',
    primaryBorderColor: '#e1e1e1',
    lineColor: '#a1a1aa',
    secondaryColor: '#f7f6f3',
    tertiaryColor: '#ffffff',
    fontSize: '15px',
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis' as const,
  },
  sequence: {
    useMaxWidth: true,
    showSequenceNumbers: true,
  },
};

// mermaid는 프론트엔드에서 가장 무거운 라이브러리 중 하나라, 정적 import 대신 동적 import로
// 코드 분할한다. 다이어그램이 포함된 글을 클라이언트에서 실제로 열 때만 별도 청크로 로드되고,
// initialize도 import 시점이 아니라 첫 렌더 시점에 한 번만 실행된다.
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const instance = mod.default;
      instance.initialize(MERMAID_CONFIG);
      return instance;
    });
  }
  return mermaidPromise;
}

export function Mermaid({ content }: MermaidProps) {
  const [svg, setSvg] = useState('');

  // 💡 인스턴스마다 고유한 ID로 렌더링 충돌 방지. useId 값에는 mermaid가
  // 셀렉터로 쓸 수 없는 문자가 섞여 있어 영숫자만 남긴다.
  const chartId = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    // content가 바뀌면 이전 렌더 결과는 버린다(늦게 도착한 응답이 덮어쓰지 않도록).
    let cancelled = false;

    (async () => {
      try {
        const mermaid = await loadMermaid();
        const { svg: generatedSvg } = await mermaid.render(chartId, content);

        // 고정 width/height를 CSS로 제어 가능하게 바꾼다. 반드시 여는 <svg> 태그
        // 안에서만 치환한다 — 문서 전체에 걸면 <rect>/<foreignObject> 의 height 까지
        // "auto" 로 바꿔 버려서 브라우저가 다이어그램 렌더링을 포기한다.
        const cleanSvg = generatedSvg.replace(/<svg\b[^>]*>/, (openTag) =>
          openTag
            .replace(/\swidth="[^"]*"/, ' width="100%"')
            .replace(/\sheight="[^"]*"/, ' height="auto"')
            .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%;"'),
        );

        if (!cancelled) setSvg(cleanSvg);
      } catch (error) {
        console.error('❌ Mermaid 렌더링 에러:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chartId, content]);

  return (
    <Dialog>
      <div className="group not-prose relative my-8 flex min-h-[200px] w-full justify-center rounded-lg border bg-muted/40 p-6 transition-colors hover:bg-muted/70">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="다이어그램 확대"
            title="자세히 보기"
            className="absolute top-4 right-4 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>

        <div
          dangerouslySetInnerHTML={{ __html: svg }}
          className="flex w-full max-w-[95%] justify-center overflow-x-auto"
        />
      </div>

      <DialogContent
        showCloseButton
        className="flex h-[90vh] w-[95vw] max-w-none items-center justify-center overflow-auto sm:max-w-none"
      >
        <DialogTitle className="sr-only">다이어그램 확대 보기</DialogTitle>
        <div
          className="mx-auto flex h-full w-full max-w-5xl items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </DialogContent>
    </Dialog>
  );
}
