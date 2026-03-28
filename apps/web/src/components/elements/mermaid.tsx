'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X } from 'lucide-react';

interface MermaidProps {
  content: string;
}

// 💡 업계 표준에 부합하는 고급 설정 (Notion/GitHub 스타일)
mermaid.initialize({
  startOnLoad: true,
  theme: 'base', // 커스텀 테마 사용을 위해 base 설정
  securityLevel: 'loose',
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
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: true,
    showSequenceNumbers: true,
  }
});

export function Mermaid({ content }: MermaidProps) {
  const [svg, setSvg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 💡 매번 고유한 ID를 생성하여 렌더링 충돌 방지
  const idRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  const renderChart = useCallback(async () => {
    try {
      const { svg: generatedSvg } = await mermaid.render(idRef.current, content);
      
      // 💡 업계 표준 팁: SVG 내부의 고정 width/height를 제거하여 CSS로 제어 가능하게 만듭니다.
      const cleanSvg = generatedSvg
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="auto"')
        .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%;"');
        
      setSvg(cleanSvg);
    } catch (error) {
      console.error('❌ Mermaid 렌더링 에러:', error);
    }
  }, [content]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // 💡 ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="group relative flex justify-center my-10 w-full bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6 border border-notion-border/40 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-200 shadow-sm">
        {/* 확대 버튼 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 right-4 p-2 rounded-md bg-white dark:bg-zinc-800 border border-notion-border/40 text-notion-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-notion-text hover:bg-notion-hover cursor-pointer z-10"
          title="자세히 보기"
        >
          <Maximize2 size={18} />
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-[95vw] h-[90vh] bg-white dark:bg-zinc-900 rounded-xl p-10 flex items-center justify-center overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-notion-hover dark:hover:bg-zinc-800 text-notion-secondary hover:text-notion-text transition-colors cursor-pointer"
            >
              <X size={24} />
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
