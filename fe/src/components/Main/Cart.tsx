import CartMenuItem from 'components/Main/CartMenuItem';
import ConfirmModal from 'components/Modal/ConfirmModal';
import PaymentModalContent from 'components/Modal/PaymentModalContent';
import { EXTRA_PRICE } from 'constant';
import { ProductOrder, Products } from 'pages/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatSameProductIdList } from 'utils';
import styles from './Cart.module.css';

interface CartProps {
  homeRef: React.RefObject<HTMLDivElement>;
  orderList: ProductOrder[];
  products: Products;
  navigate: (path: string) => void;
  handleRemoveOrder: (productId: number, size: string) => void;
  handleRemoveAllOrders: () => void;
}

export default function Cart({
  navigate,
  homeRef,
  handleRemoveAllOrders,
  handleRemoveOrder,
  products,
  orderList,
}: CartProps) {
  const [seconds, setSeconds] = useState(180);
  const intervalRef: { current: null | NodeJS.Timer } = useRef(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const formattedSameProduct = formatSameProductIdList(orderList);
  const totalPrice = orderList.reduce((acc, cur) => {
    const { productId, size, amount } = cur;
    const price = size === 'Large' ? products[productId].price + EXTRA_PRICE : products[productId].price;
    return acc + price * amount;
  }, 0);

  const resetCounter = (seconds: number) => {
    setSeconds(seconds);

    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);
  };

  const handlePaymentButtonClick = () => {
    clearInterval(intervalRef.current!);
    setShowPaymentModal(true);
  };

  const handlePaymentCancelButtonClick = () => {
    setShowPaymentModal(false);
    resetCounter(180);
  };

  const confirmRemoveAllOrders = () => {
    clearInterval(intervalRef.current!);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    resetCounter(180);
  };

  const removeAllOrders = () => {
    handleRemoveAllOrders();
    setShowConfirmModal(false);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  useEffect(() => {
    setSeconds(180);
  }, [orderList]);

  useEffect(() => {
    if (seconds <= 0) {
      handleRemoveAllOrders();
    }
  }, [seconds]);

  return (
    <div className={styles.cart}>
      <div className={styles.orderItems}>
        {formattedSameProduct.map((order, index) => {
          const { productId, size, amount } = order;
          const menu = products[productId];
          return (
            <div key={index} className={styles.itemWrapper}>
              <div className={styles.amount}>{amount}</div>
              <CartMenuItem
                className={styles.orderItemAuto}
                menuName={menu.name}
                temperature={order.temperature}
                price={size === 'Large' ? menu.price + EXTRA_PRICE : menu.price}
              />
              <button className={styles.menuCancelButton} onClick={() => handleRemoveOrder(menu.productId, size)}>
                X
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.buttons}>
        <span>
          <span className={styles.totalLabel}>총 결제 금액 : </span>
          <span className={styles.totalPrice}>₩{totalPrice.toLocaleString('ko-KR')}</span>
        </span>
        {seconds <= 30 && (
          <span className={styles.timer}>{seconds}초 뒤에 메뉴가 전체 취소돼요!</span>
        )}
        <button onClick={confirmRemoveAllOrders} className={styles.allCancelButton}>
          전체취소
        </button>
      </div>
      <button className={styles.orderButton} onClick={handlePaymentButtonClick}>
        결제하기
      </button>
      {showPaymentModal &&
        createPortal(
          <PaymentModalContent
            navigate={navigate}
            totalPrice={totalPrice}
            orderList={orderList}
            handlePaymentCancelButtonClick={handlePaymentCancelButtonClick}
          />,
          homeRef.current!
        )}
      {showConfirmModal &&
        createPortal(
          <ConfirmModal
            text={'메뉴를 모두 취소하시겠습니까?'}
            onClickYesButton={removeAllOrders}
            onClickNoButton={closeConfirmModal}
          />,
          homeRef.current!
        )}
    </div>
  );
}
