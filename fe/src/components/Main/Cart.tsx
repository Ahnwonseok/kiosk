import CartMenuItem from 'components/Main/CartMenuItem';
import ConfirmModal from 'components/Modal/ConfirmModal';
import { createOrder } from 'api';
import { EXTRA_PRICE } from 'constant';
import { ProductOrder, Products } from 'pages/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatMenuOptionOrderList } from 'utils';
import styles from './Cart.module.css';

interface CartProps {
  homeRef: React.RefObject<HTMLDivElement>;
  orderList: ProductOrder[];
  products: Products;
  navigate: (path: string) => void;
  handleIncrementOrder: (productId: number, size: string, temperature: string) => void;
  handleDecrementOrder: (productId: number, size: string, temperature: string) => void;
  handleRemoveOrder: (productId: number, size: string, temperature: string) => void;
  handleRemoveAllOrders: () => void;
}

export default function Cart({
  navigate,
  homeRef,
  handleRemoveAllOrders,
  handleIncrementOrder,
  handleDecrementOrder,
  handleRemoveOrder,
  products,
  orderList,
}: CartProps) {
  const [seconds, setSeconds] = useState(180);
  const intervalRef: { current: null | NodeJS.Timer } = useRef(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const formattedSameProduct = formatMenuOptionOrderList(orderList);
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

  const handleSubmitOrder = async () => {
    clearInterval(intervalRef.current!);
    if (orderList.length === 0) return;
    try {
      const result = await createOrder({ orderItems: [...orderList], totalPrice });
      if (result.success) {
        const orderNumber = (result as any).data.orderNumber;
        console.log(orderNumber);
        if (orderNumber !== undefined) {
          alert(`주문번호는 ${orderNumber}입니다.`);
        }
        try {
          // Notify Barista page via BroadcastChannel for real-time update
          const bc = new BroadcastChannel('orders');
          if (result.data) {
            bc.postMessage({ type: 'NEW_ORDER', order: result.data });
          } else {
            bc.postMessage({ type: 'REFRESH_ORDERS' });
          }
          bc.close();
        } catch (e) {
          // no-op if BroadcastChannel unsupported
        }
        handleRemoveAllOrders();
      } else {
        alert(result.error || '주문 등록에 실패했습니다.');
        resetCounter(180);
      }
    } catch (e) {
      alert('주문 등록에 실패했습니다.');
      resetCounter(180);
    }
  };

  const handlePaymentCancelButtonClick = () => {
    // deprecated: 결제 모달 사용 안 함
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
              <CartMenuItem
                className={styles.orderItemAuto}
                menuName={menu.name}
                temperature={order.temperature}
                price={size === 'Large' ? menu.price + EXTRA_PRICE : menu.price}
                onDecrement={() => handleDecrementOrder(menu.productId, size, order.temperature)}
                onIncrement={() => handleIncrementOrder(menu.productId, size, order.temperature)}
                quantity={amount}
              />
              <div className={styles.amount}>{amount}</div>
              <button className={styles.menuCancelButton} onClick={() => handleRemoveOrder(menu.productId, size, order.temperature)}>
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
      <button className={styles.orderButton} onClick={handleSubmitOrder}>
        주문하기
      </button>
      {/* 결제 모달 제거 */}
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
