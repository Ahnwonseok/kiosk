import { useState, useRef, useEffect } from 'react';
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator';
import OrderModal from 'components/Modal/OrderModal';
import useProducts from 'hooks/useProducts';
import { formatAllCategories } from 'utils';
import { CategoryInfo, ProductInfo, ProductOrder } from './types';
import useOutsideClick from '../hooks/useOutsideClick';
import { fetchOrders, createOrder, updateOrderStatus, deleteOrder, BASE_API_DOMAIN } from 'api';
import { ManagedOrder, OrderEvent } from 'api/types';
import styles from './BaristaPage.module.css';

interface BaristaPageProps {
  navigate: (path: string) => void;
}

export default function BaristaPage({ navigate }: BaristaPageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, loading, error] = useProducts();
  
  // OrderModal 관련 상태
  const [isOrderModalOpen, setOrderModal] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<ProductInfo | undefined>(undefined);
  const outsideModal = useRef<HTMLDivElement>(null);

  // 주문 목록 상태
  const [orderList, setOrderList] = useState<ProductOrder[]>([]);
  
  // 주문 관리 상태 (백엔드 연동)
  const [managedOrders, setManagedOrders] = useState<ManagedOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'waiting' | 'processing' | 'completed'>('waiting');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // 중복 호출 방지를 위한 ref
  const isFetchingRef = useRef(false);

  // 백엔드 API 호출 함수들
  const fetchOrdersData = async () => {
    if (isFetchingRef.current) {
      console.log('🔄 fetchOrdersData 이미 호출 중이므로 스킵');
      return;
    }
    isFetchingRef.current = true;
    setOrdersLoading(true);
    setOrdersError(null);
    
    try {
      const orders = await fetchOrders();
      setManagedOrders(orders);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : '주문 목록 조회에 실패했습니다.');
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  };

  // 실시간 업데이트 (Server-Sent Events)
  useEffect(() => {
    const eventSource = new EventSource(`${BASE_API_DOMAIN}api/orders/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        console.log('📋 SSE 이벤트 수신:', event.data);
        const data: OrderEvent = JSON.parse(event.data);
        
        switch (data.type) {
          case 'NEW_ORDER':
            console.log('📋 새 주문 이벤트:', data.order);
            if (data.order) {
              setManagedOrders(prev => {
                const newOrders = [...prev, data.order!];
                console.log('📋 업데이트된 주문 목록:', newOrders);
                return newOrders;
              });
            }
            break;
          case 'STATUS_CHANGE':
            console.log('📋 상태 변경 이벤트:', data.orderId, data.status);
            if (data.orderId && data.status) {
              setManagedOrders(prev => 
                prev.map(order => 
                  order.orderId === data.orderId 
                    ? { ...order, status: data.status as 'waiting' | 'processing' | 'completed' }
                    : order
                )
              );
            }
            break;
          case 'ORDER_DELETED':
            console.log('📋 주문 삭제 이벤트:', data.orderId);
            if (data.orderId) {
              setManagedOrders(prev => 
                prev.filter(order => order.orderId !== data.orderId)
              );
            }
            break;
        }
      } catch (error) {
        console.error('SSE 데이터 파싱 오류:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    fetchOrdersData();
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리 (실제로는 세션/토큰 삭제)
    navigate('/');
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  // OrderModal 관련 함수들
  const openOrderModal = () => setOrderModal(true);
  const closeOrderModal = () => setOrderModal(false);

  const handleAddOrder = (menuOrder: ProductOrder) => {
    // 동일한 메뉴, 온도, 사이즈의 주문이 있는지 확인하고 수량 합치기
    setOrderList(prev => {
      const existingIndex = prev.findIndex(order => 
        order.productId === menuOrder.productId &&
        order.temperature === menuOrder.temperature &&
        order.size === menuOrder.size
      );

      if (existingIndex !== -1) {
        // 기존 주문이 있으면 수량만 증가
        const updatedList = [...prev];
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          amount: updatedList[existingIndex].amount + menuOrder.amount
        };
        return updatedList;
      } else {
        // 새로운 주문이면 추가
        return [...prev, menuOrder];
      }
    });
    closeOrderModal();
  };

  const handleMenuClick = (product: ProductInfo) => {
    setSelectedMenu(product);
    openOrderModal();
  };

  // 주문 삭제 함수 (고유 식별자로 삭제)
  const handleRemoveOrder = (orderToRemove: ProductOrder) => {
    setOrderList(prev => prev.filter(order => 
      !(order.productId === orderToRemove.productId &&
        order.temperature === orderToRemove.temperature &&
        order.size === orderToRemove.size)
    ));
  };

  // 주문 등록 함수 (백엔드 연동)
  const handleConfirmOrder = async () => {
    if (orderList.length === 0) return;
    
    const totalPrice = calculateTotalPrice();
    console.log('📤 주문 등록 요청:', { orderItems: orderList, totalPrice });
    
    const result = await createOrder({
      orderItems: [...orderList],
      totalPrice
    });
    
    console.log('📥 주문 등록 응답:', result);
    
    if (result.success) {
      //alert('주문이 등록되었습니다!');
      setOrderList([]); // 주문 목록 초기화
      
      // 주문 목록을 즉시 새로고침
      await fetchOrdersData();
    } else {
      alert(result.error || '주문 등록에 실패했습니다.');
    }
  };

  // 주문 상태 변경 함수 (백엔드 연동)
  const handleStatusChange = async (orderId: string, newStatus: 'waiting' | 'processing' | 'completed') => {
    const result = await updateOrderStatus(orderId, { status: newStatus });

    if (result.success) {
      // 성공 시 즉시 UI 반영 (SSE가 올 때까지 기다리지 않음)
      setManagedOrders(prev => 
        prev.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      alert(result.error || '주문 상태 변경에 실패했습니다.');
    }
  };

  // 주문 삭제 함수 (백엔드 연동)
  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm('삭제하시겠습니까?');
    if (!confirmed) return;

    const result = await deleteOrder(orderId);
    if (result.success) {
      setManagedOrders(prev => prev.filter(order => order.orderId !== orderId));
    } else {
      alert(result.error || '주문 삭제에 실패했습니다.');
    }
  };

  // 총 금액 계산
  const calculateTotalPrice = () => {
    return orderList.reduce((total, order) => {
      const product = products
        .flatMap(category => category.products)
        .find(p => p.productId === order.productId);
      
      if (!product) return total;
      
      let price = product.price;
      if (order.size === 'Large') {
        price += 500; // Large 사이즈 추가 가격
      }
      
      return total + (price * order.amount);
    }, 0);
  };

  // 상태별 주문 필터링
  const filteredOrders = managedOrders.filter(order => order.status === selectedStatus);

  useOutsideClick(outsideModal, closeOrderModal);

  // 카테고리 정보 추출
  const categoryNavbarInfo = products.map((category: CategoryInfo) => {
    return { categoryId: category.categoryId, categoryName: category.categoryName };
  });

  // 포맷된 메뉴 데이터
  const formattedMenuData = formatAllCategories(products);
  const currentMenus = selectedCategoryId ? formattedMenuData[selectedCategoryId] : null;

  // 첫 번째 카테고리를 기본 선택
  if (!selectedCategoryId && products.length > 0) {
    setSelectedCategoryId(products[0].categoryId);
  }

  if (loading) return <LoadingIndicator text="메뉴를 불러오는 중입니다. 잠시만 기다려주세요!" />;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.baristaContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>바리스타 관리 시스템</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </header>

      <nav className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          주문 관리
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'menu' ? styles.active : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          메뉴 관리
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          설정
        </button>
      </nav>

      <main className={styles.mainContent}>
        {activeTab === 'orders' && (
          <div className={styles.ordersContainer}>
            {/* 좌측: 새로운 주문 받기 */}
            <div className={styles.orderInputSection}>
              <h2>새 주문 받기</h2>
              <div className={styles.menuSelection}>
                <h3>메뉴 선택</h3>
                
                {/* 카테고리 탭 */}
                <div className={styles.categoryTabs}>
                  {categoryNavbarInfo.map((category) => (
                    <button
                      key={category.categoryId}
                      className={`${styles.categoryTab} ${selectedCategoryId === category.categoryId ? styles.active : ''}`}
                      onClick={() => handleCategoryClick(category.categoryId)}
                    >
                      {category.categoryName}
                    </button>
                  ))}
                </div>

                {/* 메뉴 리스트 */}
                <div className={styles.menuList}>
                  {currentMenus?.products.map((product: ProductInfo) => (
                    <div 
                      key={product.productId} 
                      className={styles.menuItem}
                      onClick={() => handleMenuClick(product)}
                    >
                      <div className={styles.menuInfo}>
                        <span className={styles.menuName}>{product.name}</span>
                        <span className={styles.menuPrice}>{product.price.toLocaleString()}원</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.orderDetails}>
                <h3>주문 상세</h3>
                {orderList.length === 0 ? (
                  <div className={styles.emptyOrder}>
                    <p>주문할 메뉴를 선택해주세요</p>
                  </div>
                ) : (
                  <>
                    {orderList.map((order, index) => {
                      const product = products
                        .flatMap(category => category.products)
                        .find(p => p.productId === order.productId);
                      
                      if (!product) return null;
                      
                      let price = product.price;
                      if (order.size === 'Large') {
                        price += 500; // Large 사이즈 추가 가격
                      }
                      
                      return (
                        <div key={index} className={styles.orderItem}>
                          <span>
                            {order.name} ({order.size}, {order.temperature}) x {order.amount}
                          </span>
                          <span>{(price * order.amount).toLocaleString()}원</span>
                          <button 
                            className={styles.removeButton}
                            onClick={() => handleRemoveOrder(order)}
                          >
                            삭제
                          </button>
                        </div>
                      );
                    })}
                    <div className={styles.orderTotal}>
                      <strong>총 금액: {calculateTotalPrice().toLocaleString()}원</strong>
                    </div>
                    <button 
                      className={styles.confirmOrderButton}
                      onClick={handleConfirmOrder}
                    >
                      주문 등록
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 우측: 주문 관리 */}
            <div className={styles.orderManagementSection}>
              <h2>주문 관리</h2>
              
              <div className={styles.orderStatusTabs}>
                <button 
                  className={`${styles.statusTab} ${selectedStatus === 'waiting' ? styles.active : ''}`}
                  onClick={() => setSelectedStatus('waiting')}
                >
                  대기 ({managedOrders.filter(o => o.status === 'waiting').length})
                </button>
                <button 
                  className={`${styles.statusTab} ${selectedStatus === 'processing' ? styles.active : ''}`}
                  onClick={() => setSelectedStatus('processing')}
                >
                  진행중 ({managedOrders.filter(o => o.status === 'processing').length})
                </button>
                <button 
                  className={`${styles.statusTab} ${selectedStatus === 'completed' ? styles.active : ''}`}
                  onClick={() => setSelectedStatus('completed')}
                >
                  완료 ({managedOrders.filter(o => o.status === 'completed').length})
                </button>
              </div>

              <div className={styles.orderList}>
                {ordersLoading ? (
                  <div className={styles.loadingContainer}>
                    <LoadingIndicator text="주문 목록을 불러오는 중입니다..." />
                  </div>
                ) : ordersError ? (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{ordersError}</p>
                    <button 
                      className={styles.retryButton}
                      onClick={fetchOrdersData}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className={styles.emptyOrder}>
                    <p>{selectedStatus === 'waiting' ? '대기 중인 주문이 없습니다' : 
                        selectedStatus === 'processing' ? '진행 중인 주문이 없습니다' : 
                        '완료된 주문이 없습니다'}</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.orderNumber} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <span className={styles.orderNumber}>{order.orderNumber}</span>
                        <span className={styles.orderTime}>{order.orderTime}</span>
                      </div>
                      <div className={styles.orderItems}>
                        {order.orderItems.map((item, index) => (
                          <div key={index}>
                            {item.name} ({item.size}, {item.temperature}) x {item.amount}
                          </div>
                        ))}
                      </div>
                      <div className={styles.orderActions}>
                        {order.status === 'waiting' && (
                          <>
                            <button 
                              className={styles.actionButton}
                              onClick={() => handleStatusChange(order.orderId, 'processing')}
                            >
                              진행중
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.dangerButtonSmall}`}
                              onClick={() => handleDeleteOrder(order.orderId)}
                            >
                              삭제
                            </button>
                          </>
                        )}
                        {order.status === 'processing' && (
                          <button 
                            className={styles.actionButton}
                            onClick={() => handleStatusChange(order.orderId, 'completed')}
                          >
                            완료
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span className={styles.completedStatus}>완료됨</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className={styles.tabContent}>
            <h2>메뉴 관리</h2>
            <p>메뉴 추가, 수정, 삭제 기능이 여기에 들어갈 예정입니다.</p>
            <div className={styles.placeholder}>
              <p>🚧 메뉴 관리 기능 개발 중 🚧</p>
              <p>메뉴 등록, 가격 변경, 품절 처리 등의 기능이 추가될 예정입니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <h2>설정</h2>
            <p>시스템 설정 및 계정 관리 기능이 여기에 들어갈 예정입니다.</p>
            <div className={styles.placeholder}>
              <p>🚧 설정 기능 개발 중 🚧</p>
              <p>계정 정보 변경, 시스템 설정 등의 기능이 추가될 예정입니다.</p>
            </div>
          </div>
        )}
      </main>

      {/* OrderModal */}
      {isOrderModalOpen && selectedMenu && (
        <div ref={outsideModal} className={styles.mainDim}>
          <OrderModal 
            handleAddOrder={handleAddOrder} 
            menu={selectedMenu} 
            closeOrderModal={closeOrderModal} 
          />
        </div>
      )}
    </div>
  );
} 