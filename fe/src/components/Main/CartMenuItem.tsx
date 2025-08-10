import styles from './CartMenuItem.module.css';

interface CartMenuItemProps {
  menuName: string;
  temperature: string;
  price: number;
  className?: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  quantity?: number;
}

export default function CartMenuItem({ menuName, temperature, price, className, onIncrement, onDecrement, quantity }: CartMenuItemProps) {
  const handleClickDecrement = () => {
    if (!onDecrement) return;
    if (typeof quantity === 'number' && quantity <= 1) return;
    onDecrement();
  };

  return (
    <div className={`${className ?? ''} ${styles.cartMenuItem}`}>
      <div className={styles.name}>{menuName}</div>
      <div
        className={`${styles.temp} ${
          temperature.toLowerCase() === 'hot' ? styles.tempHot : temperature.toLowerCase() === 'ice' ? styles.tempIce : ''
        }`}
      >
        {temperature}
      </div>
      <div className={styles.priceControls}>
        <button
          className={styles.ctrlBtn}
          onClick={handleClickDecrement}
          disabled={!onDecrement || (typeof quantity === 'number' && quantity <= 1)}
        >
          -
        </button>
        <div className={styles.price}>{price.toLocaleString()}원</div>
        <button className={styles.ctrlBtn} onClick={onIncrement} disabled={!onIncrement}>+</button>
      </div>
    </div>
  );
}

