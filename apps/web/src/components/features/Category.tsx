'use client';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
}

export function Category({ categories, currentActiveCategory, handleCurrentActiveCategory }: CategoryProps) {
  return (
    <ul className="flex gap-4 items-center flex-wrap w-full mt-4 mb-8">
      {categories.map(([name, count]) => {
        const isActive = name === currentActiveCategory;
        
        return (
          <li 
            key={name}
            onClick={() => handleCurrentActiveCategory(name)}
            className={`
              cursor-pointer px-4 py-2 rounded-full text-lg font-medium transition-colors
              ${isActive 
                ? 'bg-main text-white' 
                : 'bg-light-grey text-grey hover:bg-gray-200'
              }
            `}
          >
            {name} <span className="ml-1 text-sm opacity-80">({count})</span>
          </li>
        );
      })}
    </ul>
  );
}
