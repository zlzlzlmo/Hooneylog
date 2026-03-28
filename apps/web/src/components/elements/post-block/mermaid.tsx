'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// 업계 표준에 부합하는 고급 설정 (Notion/GitHub 스타일)
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
    useMaxWidth: true, // 너비 자동 조절
    htmlLabels: true,
    curve: 'basis',
  },
  er: {
    useMaxWidth: true,
  },
  sequence: {
    useMaxWidth: true,
    showSequenceNumbers: true,
  }
});

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string>('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Mermaid 렌더링 시 고유 ID 부여
        const { svg: generatedSvg } = await mermaid.render(idRef.current, chart);
        
        // 💡 업계 표준 팁: SVG 내부의 고정 width/height를 제거하여 CSS로 제어 가능하게 만듭니다.
        const cleanSvg = generatedSvg
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="auto"')
          .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%;"');
          
        setSvg(cleanSvg);
      } catch (error) {
        console.error('Mermaid render failed:', error);
        setSvg(`<div class="text-red-500 p-4 border border-red-100 bg-red-50 rounded-[4px] text-sm font-mono">
          <p class="font-bold mb-2">⚠️ Mermaid 렌더링 오류</p>
          <pre class="whitespace-pre-wrap">${chart}</pre>
        </div>`);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  return (
    <div 
      className="mermaid-container w-full my-10 flex justify-center bg-white/50 py-6 rounded-lg border border-notion-border/40 hover:bg-white/80 transition-colors"
      style={{ minHeight: '100px' }}
    >
      <div 
        className="w-full max-w-[95%] overflow-visible" 
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
}
