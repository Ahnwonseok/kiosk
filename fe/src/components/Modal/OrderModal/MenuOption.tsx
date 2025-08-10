import { Button } from 'components/atoms/Button';
import styles from './OrderModal.module.css';
import { useEffect } from 'react';

interface MenuOptionProps extends SizeOptionProps, TempOptionProps, AmountCounterProps {
  setSelectedSize: (size: string) => void;
  setSelectedTemp: (temp: string) => void;
}

interface SizeOptionProps {
  hasLarge: boolean;
  hasSmall: boolean;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
}

interface TempOptionProps {
  hasHot: boolean;
  hasIce: boolean;
  selectedTemp: string;
  setSelectedTemp: (temp: string) => void;
}

interface AmountCounterProps {
  amount: number;
  setAmount: (amount: number) => void;
}

export default function MenuOption({
  hasLarge,
  hasSmall,
  hasHot,
  hasIce,
  selectedSize,
  setSelectedSize,
  selectedTemp,
  setSelectedTemp,
  amount,
  setAmount,
}: MenuOptionProps) {
  // Auto-select size when size option is not shown (current products have only one size)
  useEffect(() => {
    const autoSize = hasSmall ? 'Small' : hasLarge ? 'Large' : '';
    if (autoSize && selectedSize !== autoSize) {
      setSelectedSize(autoSize);
    }
  }, [hasSmall, hasLarge, selectedSize, setSelectedSize]);

  return (
    <div className={styles.optionWrap}>
      <TempOption hasHot={hasHot} hasIce={hasIce} selectedTemp={selectedTemp} setSelectedTemp={setSelectedTemp} />
      {/* Size selection removed intentionally */}
      <AmountCounter amount={amount} setAmount={setAmount} />
    </div>
  );
}

// Size selection UI removed

function TempOption({ hasHot, hasIce, selectedTemp, setSelectedTemp }: TempOptionProps) {
  // Auto-select when only one temperature option is available
  useEffect(() => {
    if (!hasHot && hasIce && selectedTemp !== 'Ice') {
      setSelectedTemp('Ice');
    }
    if (hasHot && !hasIce && selectedTemp !== 'Hot') {
      setSelectedTemp('Hot');
    }
  }, [hasHot, hasIce, selectedTemp, setSelectedTemp]);

  return (
    <div className={hasHot && hasIce ? styles.dualButtonWrap : styles.singleButtonWrap}>
      {hasHot && (
        <Button
          label={'Hot'}
          className={`${styles.optionButton} ${styles.hotButton}`}
          isSelected={selectedTemp === 'Hot'}
          selectedClassName={styles.selectedHot}
          onClick={() => setSelectedTemp('Hot')}
        />
      )}
      {hasIce && (
        <Button
          label={'Ice'}
          className={`${styles.optionButton} ${styles.iceButton}`}
          isSelected={selectedTemp === 'Ice'}
          selectedClassName={styles.selectedIce}
          onClick={() => setSelectedTemp('Ice')}
        />
      )}
    </div>
  );
}

function AmountCounter({ amount, setAmount }: AmountCounterProps) {
  const plusAmount = () => {
    amount === 99 ? setAmount(99) : setAmount(amount + 1);
  };

  const minusAmount = () => {
    amount === 1 ? setAmount(1) : setAmount(amount - 1);
  };

  return (
    <div className={styles.counter}>
      <button onClick={minusAmount}>-</button>
      <span>{amount}</span>
      <button onClick={plusAmount}>+</button>
    </div>
  );
}
