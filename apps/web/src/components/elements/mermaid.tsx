'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  content: string;
}

// 💡 Mermaid 초기화 설정
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral', // 노션 스타일과 어울리도록 중립 테마 선택
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

export function Mermaid({ content }: MermaidProps) {
  const [svg, setSvg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 💡 매번 고유한 ID를 생성하여 렌더링 충돌 방지
  const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    const render = async () => {
      try {
        const { svg } = await mermaid.render(id, content);
        setSvg(svg);
      } catch (error) {
        console.error('❌ Mermaid 렌더링 에러:', error);
      }
    };

    render();
  }, [id, content]);

  return (
    <div className="flex justify-center my-6 overflow-x-auto w-full bg-notion-gray-bg/20 rounded-lg p-6 border border-notion-border">
      <div 
        ref={containerRef} 
        dangerouslySetInnerHTML={{ __html: svg }} 
        className="max-w-full"
      />
    </div>
  );
}
