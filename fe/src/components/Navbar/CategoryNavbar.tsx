import { forwardRef } from 'react';
import CategoryButton from './CategoryButton';
import styles from './CategoryNavbar.module.css';

interface CategoryNavbarProps {
  handleCategoryClick: (categoryId: number) => void;
  selectedCategoryId: number;
  categories: { categoryId: number; categoryName: string }[];
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

const CategoryNavbar = forwardRef<HTMLDivElement, CategoryNavbarProps>(
  ({ handleCategoryClick, selectedCategoryId, categories, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }, ref) => {
    return (
      <div 
        className={styles.categoryNavbar} 
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {categories.map(category => (
          <CategoryButton
            id={category.categoryId}
            isActive={selectedCategoryId === category.categoryId}
            categoryName={category.categoryName}
            key={category.categoryId}
            handleCategoryClick={handleCategoryClick}
          />
        ))}
      </div>
    );
  }
);

export default CategoryNavbar;
