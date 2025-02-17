import React, { forwardRef } from 'react';

interface CategoryNavbarProps {
  selectedCategoryId: number;
  categories: Array<{ categoryId: number; categoryName: string }>;
  handleCategoryClick: (categoryId: number) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

const CategoryNavbar = forwardRef<HTMLDivElement, CategoryNavbarProps>(
  ({ selectedCategoryId, categories, handleCategoryClick, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }, ref) => {
    return (
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ cursor: 'grab', overflowX: 'auto' }}
      >
        {/* 기존 네비게이션 바 내용 */}
      </div>
    );
  }
);

export default CategoryNavbar; 