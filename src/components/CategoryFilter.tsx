import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/link';
import { useTranslations } from 'next-intl';

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories: categoriesProp,
  selectedCategory = 'all',
  onSelectCategory = () => console.log('Category selected')
}) => {
  const catT = useTranslations('categories');

  const defaultCategories: Category[] = [
    { id: 'all', name: catT('all'), description: 'All categories', icon: '🔥', color: 'gray', slug: 'all', isActive: true },
    { id: 'ai', name: catT('ai'), description: 'AI & Machine Learning', icon: '🤖', color: 'purple', slug: 'ai-ml', isActive: true },
    { id: 'web', name: catT('web'), description: 'Web Development', icon: '💻', color: 'blue', slug: 'web-dev', isActive: true },
    { id: 'design', name: catT('design'), description: 'Design Resources', icon: '🎨', color: 'pink', slug: 'design', isActive: true },
    { id: 'tools', name: catT('tools'), description: 'Productivity Tools', icon: '🛠️', color: 'green', slug: 'tools', isActive: true },
    { id: 'mobile', name: catT('mobile'), description: 'Mobile Development', icon: '📱', color: 'indigo', slug: 'mobile', isActive: true }
  ];

  const categories = categoriesProp || defaultCategories;
  console.log('CategoryFilter rendered with', categories.length, 'categories');
  
  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-brand-gradient text-white shadow-lg';
    }

    const colorMap = {
      purple: 'hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/30',
      blue: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30',
      pink: 'hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30',
      green: 'hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30',
      indigo: 'hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30',
      gray: 'hover:bg-gray-500/20 hover:text-gray-400 hover:border-gray-500/30'
    };

    return `bg-card/30 text-muted-foreground border-border/30 ${colorMap[color as keyof typeof colorMap] || colorMap.gray}`;
  };
  
  return (
    <div data-cmp="CategoryFilter" className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: selectedCategory === category.id
              ? 'var(--gradient-primary)'
              : 'var(--bg-muted)'
          }}
        >
          <span className="text-lg">{category.icon}</span>
          <span className={`font-medium ${
            selectedCategory === category.id ? 'text-white' : 'text-muted-foreground'
          }`}>
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;