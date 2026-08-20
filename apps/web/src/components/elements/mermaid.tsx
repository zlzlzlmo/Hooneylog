'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

        // 💡 업계 표준 팁: SVG 내부의 고정 width/height를 제거하여 CSS로 제어 가능하게 만듭니다.
        const cleanSvg = generatedSvg
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="auto"')
          .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%;"');

        if (!cancelled) setSvg(cleanSvg);
      } catch (error) {
        console.error('❌ Mermaid 렌더링 에러:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chartId, content]);

  // 💡 ESC 키로 모달 닫기 + 포커스 관리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
      closeBtnRef.current?.focus();
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="group relative flex justify-center my-10 w-full min-h-[200px] bg-notion-gray-bg/40 rounded-[4px] p-6 border border-notion-border hover:bg-notion-gray-bg/70 transition-colors duration-200">
        {/* 확대 버튼 */}
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="다이어그램 확대"
          className="absolute top-4 right-4 p-2 rounded-[3px] bg-notion-bg border border-notion-border text-notion-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-notion-text hover:bg-notion-hover cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
          title="자세히 보기"
        >
          <Maximize2 size={18} aria-hidden="true" />
        </button>

        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }}
          className="w-full max-w-[95%] overflow-visible flex justify-center"
        />
      </div>

      {/* 라이트박스 모달 (업계 표준 상세 보기 구현) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="다이어그램 확대 보기"
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* 배경 클릭으로 닫기. div + onClick 대신 실제 버튼이라 키보드로도 닿는다. */}
          <button
            type="button"
            aria-label="확대 보기 닫기"
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          />
          <div className="relative w-[95vw] h-[90vh] bg-notion-bg border border-notion-border rounded-[4px] p-10 flex items-center justify-center overflow-auto shadow-2xl">
            {/* 닫기 버튼 */}
            <button
              ref={closeBtnRef}
              onClick={() => setIsModalOpen(false)}
              aria-label="닫기"
              className="absolute top-6 right-6 p-2 rounded-[3px] hover:bg-notion-hover text-notion-secondary hover:text-notion-text transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
            >
              <X size={24} aria-hidden="true" />
            </button>

            {/* 상세 보기 다이어그램 */}
            <div
              className="w-full h-full flex items-center justify-center max-w-5xl mx-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
