import styles from './CartMenuItem.module.css';

interface CartMenuItemProps {
  menuName: string;
  temperature: string;
  price: number;
  className?: string;
}

export default function CartMenuItem({ menuName, temperature, price, className }: CartMenuItemProps) {
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
      <div className={styles.price}>{price.toLocaleString()}원</div>
    </div>
  );
}

