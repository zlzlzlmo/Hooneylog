
export function getCategoryImageSrc(category: string): string {
  const categoryMap: Record<string, string> = {
    'css': '/images/css.png',
    'html': '/images/html.png',
    'javascript': '/images/javascript.png',
    'nestjs': '/images/nestjs.png',
    'nextjs': '/images/nextjs.png',
    'react': '/images/react.png',
    'typescript': '/images/typescript.png',
    '알고리즘': '/images/알고리즘.png',
    '최적화': '/images/최적화.png',
    'refactoring': '/images/refactoring.png',
    'esbuild': '/images/esbuild.png',
  };

  const formattedCategory = category.toLowerCase().trim();
  return categoryMap[formattedCategory] || '/images/default.png';
}
