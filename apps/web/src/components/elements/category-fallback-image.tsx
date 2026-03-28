import { useMemo } from 'react';

interface CategoryFallbackImageProps {
  category: string;
  className?: string;
}

// Generate consistent gradient colors based on category name
const getGradientColors = (category: string) => {
  // Simple string hashing function
  let hash = 0;
  const str = category || 'Notion';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // HSL is great for vibrant UI colors. 
  // We use dark mode friendly, slightly muted but colorful pastel tones.
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40 + Math.abs(hash % 40)) % 360; // Analogous/adjacent hue for smooth gradient
  
  const s = 65 + Math.abs(hash % 15); // 65-80%
  const l = 55 + Math.abs((hash >> 2) % 15); // 55-70% (not too bright)
  
  return {
    from: `hsl(${h1}, ${s}%, ${l}%)`,
    to: `hsl(${h2}, ${s}%, ${l}%)`
  };
};

export function CategoryFallbackImage({ category, className = '' }: CategoryFallbackImageProps) {
  const colors = useMemo(() => getGradientColors(category), [category]);
  const initial = (category || 'Notion').substring(0, 2).toUpperCase();

  return (
    <div 
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
      }}
    >
      <span className="text-white font-bold text-4xl sm:text-5xl opacity-40 drop-shadow-sm mix-blend-overlay tracking-widest">
        {initial}
      </span>
    </div>
  );
}
