import styles from './MenuItem.module.css';

interface MenuItemProps {
  productId: number;
  menuName: string;
  menuImg: string;
  menuPrice: number;
  className?: string;
  isBest?: boolean;
  hasLarge?: boolean;
  hasSmall?: boolean;
  hasHot?: boolean;
  hasIce?: boolean;
  openOrderModal?: () => void;
  setSelectedMenu?: any;
  showTemperatures?: boolean;
  shrinkNameToFit?: boolean;
}

export default function MenuItem({
  productId,
  menuName,
  menuImg,
  menuPrice,
  isBest,
  hasLarge,
  hasSmall,
  hasHot,
  hasIce,
  className = styles.menuItem,
  openOrderModal,
  setSelectedMenu,
  showTemperatures = true,
  shrinkNameToFit = false,
}: MenuItemProps) {
  const clickMenu = () => {
    setSelectedMenu &&
      setSelectedMenu({
        name: menuName,
        productId: productId,
        price: menuPrice,
        imgUrl: menuImg,
        hasLarge: hasLarge,
        hasSmall: hasSmall,
        hasHot: hasHot,
        hasIce: hasIce,
      });
    openOrderModal && openOrderModal();
  };

  return (
    <div onClick={clickMenu} className={className}>
      {/* {isBest && <div className={styles.best}>인기</div>} */}
      <img src={menuImg} alt={menuName} />
      <div className={styles.menuNameContainer}>
        <span
          className={styles.menuName}
          ref={(el) => {
            if (!el || !shrinkNameToFit) return;
            const container = el.parentElement;
            if (!container) return;
            // Prevent wrapping and shrink font-size until it fits or min size reached
            el.style.whiteSpace = 'nowrap';
            let sizeRem = 1.2;
            el.style.fontSize = `${sizeRem}rem`;
            // Loop guard to avoid long loops
            for (let i = 0; i < 10; i++) {
              const tooWide = el.scrollWidth > container.clientWidth;
              if (!tooWide || sizeRem <= 0.8) break;
              sizeRem -= 0.1;
              el.style.fontSize = `${sizeRem}rem`;
            }
          }}
        >
          {menuName}
        </span>
      </div>
      {showTemperatures && (
        <div className={styles.badges}>
          {hasIce && <span className={`${styles.badge} ${styles.ice}`}>Ice</span>}
          {hasHot && <span className={`${styles.badge} ${styles.hot}`}>Hot</span>}
          {!hasIce && !hasHot && (
            <span className={`${styles.badge} ${styles.hot}`}>Hot</span>
          )}
        </div>
      )}
      <span className={styles.price}>{menuPrice.toLocaleString('ko-KR')}</span>
    </div>
  );
}
