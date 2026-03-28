'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with default settings
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Generate a unique ID for each chart
        const { svg: generatedSvg } = await mermaid.render(idRef.current, chart);
        setSvg(generatedSvg);
      } catch (error) {
        console.error('Mermaid render failed:', error);
        // Fallback to showing the raw text if rendering fails
        setSvg(`<pre class="text-red-500 p-4 border border-red-200 rounded">Graph rendering failed. Check your mermaid syntax.\n\n${chart}</pre>`);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex justify-center my-8 w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
