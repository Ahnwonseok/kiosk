import { useState, useRef, useEffect } from 'react';
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator';
import OrderModal from 'components/Modal/OrderModal';
import MenuAdmin from 'components/MenuAdmin';
import useProducts from 'hooks/useProducts';
import { formatAllCategories } from 'utils';
import { CategoryInfo, ProductInfo, ProductOrder } from './types';
import useOutsideClick from '../hooks/useOutsideClick';
import { fetchOrders, createOrder, updateOrderStatus, deleteOrder, fetchOrderStats, BASE_API_DOMAIN } from 'api';
import { ManagedOrder, OrderEvent, OrderStatsPeriod, OrderStatsResponse } from 'api/types';
import styles from './BaristaPage.module.css';

function StatsTab() {
  const [period, setPeriod] = useState<OrderStatsPeriod>('daily');
  const [data, setData] = useState<OrderStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = await fetchOrderStats(period);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setStatsError(e instanceof Error ? e.message : '통계를 불러오지 못했습니다.');
          setData(null);
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const points = data?.points ?? [];
  const maxAmount = points.length ? Math.max(...points.map((p) => p.revenue), 1) : 1;
  const hasAnyBar = points.some((p) => p.revenue > 0);

  const periodLabel =
    period === 'daily' ? '최근 14일' : period === 'weekly' ? '최근 8주(월요일 시작)' : '최근 12개월';

  return (
    <div className={styles.tabContent}>
      <h2>통계</h2>
      <p className={styles.statsLead}>
        완료된 주문만 집계합니다. 주문 시각으로 일·주·월을 나눕니다.
      </p>
      <div className={styles.statsPeriodTabs}>
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={period === p ? styles.statsPeriodTabActive : styles.statsPeriodTab}
            onClick={() => setPeriod(p)}
          >
            {p === 'daily' ? '일별' : p === 'weekly' ? '주간' : '월간'}
          </button>
        ))}
      </div>
      {statsLoading ? (
        <div className={styles.statsLoading}>통계를 불러오는 중…</div>
      ) : statsError ? (
        <div className={styles.statsEmpty}>{statsError}</div>
      ) : !data || data.totalCompletedOrders === 0 || !hasAnyBar ? (
        <div className={styles.statsEmpty}>선택한 구간에 완료 주문이 없어 매출 그래프를 표시할 수 없습니다.</div>
      ) : (
        <>
          <div className={styles.statsSummary}>
            <div className={styles.statsSummaryItem}>
              <span className={styles.statsSummaryLabel}>{periodLabel} 완료 매출 합계</span>
              <span className={styles.statsSummaryValue}>{data.totalRevenue.toLocaleString()}원</span>
            </div>
            <div className={styles.statsSummaryItem}>
              <span className={styles.statsSummaryLabel}>완료 건수 합계</span>
              <span className={styles.statsSummaryValue}>{data.totalCompletedOrders}건</span>
            </div>
          </div>
          <div className={styles.chartWrap}>
            <h3 className={styles.chartTitle}>
              {period === 'daily' ? '일별 매출' : period === 'weekly' ? '주간 매출' : '월간 매출'}
            </h3>
            <div
              className={styles.chartArea}
              role="img"
              aria-label="기간별 매출 막대 그래프"
            >
              {points.map((pt) => (
                <div key={pt.sortKey} className={styles.chartColumn}>
                  <div className={styles.chartBarTrack}>
                    <div
                      className={styles.chartBarFill}
                      style={{
                        height: `${pt.revenue > 0 ? (pt.revenue / maxAmount) * 100 : 0}%`,
                      }}
                      title={`${pt.label}: ${pt.revenue.toLocaleString()}원 (${pt.orderCount}건)`}
                    />
                  </div>
                  <span className={styles.chartXLabel}>{pt.label}</span>
                  <span className={styles.chartAmountLabel}>{pt.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface BaristaPageProps {
  navigate: (path: string) => void;
}

export default function BaristaPage({ navigate }: BaristaPageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'stats'>('orders');
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
      // Ensure completedAt exists for completed orders if backend doesn't supply it
      const normalized = orders.map((o) => {
        if (o.status === 'completed' && !o.completedAt) {
          return { ...o, completedAt: o.orderTime } as any;
        }
        return o as any;
      });
      setManagedOrders(normalized);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : '주문 목록 조회에 실패했습니다.');
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  };

  // 실시간 업데이트 (Server-Sent Events) + 자동 재연결
  useEffect(() => {
    const sseUrl = new URL('api/orders/stream', BASE_API_DOMAIN);
    const jwt = localStorage.getItem('jwt');
    if (jwt) sseUrl.searchParams.set('token', jwt);

    let eventSource: EventSource | null = null;
    let retryDelayMs = 1000;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      try {
        eventSource = new EventSource(sseUrl.toString());
        if (!eventSource) return;
        eventSource.onopen = () => {
          console.log('🔗 SSE 연결 수립:', sseUrl.toString());
          retryDelayMs = 1000; // reset backoff on success
        };
        eventSource.onmessage = (event: MessageEvent) => {
          try {
            console.log('📋 SSE 이벤트 수신:', event.data);
            const data: OrderEvent = JSON.parse(event.data);
            console.log('📋 파싱된 SSE 데이터:', data);
            switch (data.type) {
              case 'NEW_ORDER':
                console.log('📋 새 주문 이벤트:', data.order);
                if (data.order) {
                  setManagedOrders(prev => {
                    if (prev.some(o => o.orderId === data.order!.orderId)) return prev;
                    const newOrders = [...prev, data.order!];
                    console.log('📋 업데이트된 주문 목록:', newOrders);
                    return newOrders;
                  });
                }
                break;
              case 'STATUS_CHANGE':
                console.log('📋 상태 변경 이벤트 수신됨:', data.orderId, data.status);
                console.log('📋 현재 managedOrders:', managedOrders);
                if (data.orderId && data.status) {
                  setManagedOrders(prev => {
                    console.log('📋 상태 변경 전 주문 목록:', prev);
                    const updated = prev.map(order => {
                      console.log('order.orderId ', order.orderId);
                      console.log('data.orderId ', data.orderId);
                      console.log('order.orderId != data.orderId ', order.orderId != data.orderId);
                      if (order.orderId != data.orderId) return order;
                      const next: any = { ...order, status: data.status as 'waiting' | 'processing' | 'completed' };
                      if (data.status === 'completed') {
                        next.completedAt = new Date().toISOString();
                      }
                      console.log('📋 주문 상태 업데이트:', order.orderId, '->', next.status);
                      return next;
                    }).filter((order): order is ManagedOrder => order !== undefined);
                    
                    console.log('📋 상태 변경 후 주문 목록:', updated);
                    return updated;
                  });
                } else {
                  console.warn('📋 STATUS_CHANGE 이벤트에 orderId 또는 status가 없음:', data);
                }
                break;
                case 'ORDER_DELETED':
                  console.log('📋 주문 삭제 이벤트:', data.orderId, '상태:', data.status);
                  console.log('📋 전체 삭제 데이터:', data);
                  console.log('📋 data.order:', data.order);
                  
                  // SSE 이벤트에서 주문 ID 추출 (data.order.id 또는 data.orderId 사용)
                  const orderIdToDelete = (data.order as any)?.id?.toString() || data.orderId?.toString();
                  
                  if (orderIdToDelete) {
                    // 백엔드 주문 목록에서 제거하기 전에 주문 정보 저장
                    const deletedOrder = managedOrders.find(order => order.orderId === orderIdToDelete);
                    
                    // 백엔드 주문 목록에서 제거
                    setManagedOrders(prev => {
                      const filtered = prev.filter(order => order.orderId !== orderIdToDelete);
                      console.log('📋 주문 삭제 후 업데이트된 목록:', filtered);
                      return filtered;
                    });
                    
                    // 장바구니에서도 동일한 주문이 있다면 제거
                    if (deletedOrder && deletedOrder.orderItems) {
                      console.log('📋 장바구니 동기화 시작 - 삭제된 주문 아이템:', deletedOrder.orderItems);
                      setOrderList(prev => {
                        const updated = prev.filter(cartItem => {
                          // 삭제된 주문 아이템과 장바구니 아이템을 비교하여 제거
                          const shouldRemove = deletedOrder.orderItems.some(orderItem => 
                            orderItem.productId === cartItem.productId &&
                            orderItem.temperature === cartItem.temperature &&
                            orderItem.size === cartItem.size
                          );
                          if (shouldRemove) {
                            console.log('📋 장바구니에서 제거할 아이템:', cartItem);
                          }
                          return !shouldRemove;
                        });
                        console.log('📋 장바구니에서 주문 삭제 후 업데이트:', updated);
                        return updated;
                      });
                    } else {
                      console.log('📋 삭제된 주문 정보가 없어서 장바구니 동기화 스킵');
                    }
                  } else {
                    console.warn('📋 ORDER_DELETED 이벤트에 orderId가 없음:', data);
                  }
                  break;
            }
          } catch (err) {
            console.error('SSE 데이터 파싱 오류:', err);
          }
        };
        eventSource.onerror = (error: Event) => {
          console.error('SSE 연결 오류:', error);
          if (eventSource) {
            try { eventSource.close(); } catch {}
            eventSource = null;
          }
          if (!stopped) {
            setTimeout(connect, retryDelayMs);
            retryDelayMs = Math.min(retryDelayMs * 2, 30000);
          }
        };
      } catch (e) {
        console.error('SSE 초기화 실패:', e);
        if (!stopped) {
          setTimeout(connect, retryDelayMs);
          retryDelayMs = Math.min(retryDelayMs * 2, 30000);
        }
      }
    };

    connect();
    
    return () => {
      stopped = true;
      if (eventSource) eventSource.close();
    };
  }, []);

  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    fetchOrdersData();
    // Listen for local broadcast messages to sync orders without SSE
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('orders');
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'NEW_ORDER' && data.order) {
          setManagedOrders(prev => [...prev, data.order]);
        }
        if (data.type === 'REFRESH_ORDERS') {
          fetchOrdersData();
        }
      };
    } catch (e) {
      // BroadcastChannel not supported; ignore
    }
    return () => {
      if (bc) bc.close();
    };
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
    
    const result = await createOrder({
      orderItems: [...orderList],
      totalPrice
    });
    
    if (result.success) {
      setOrderList([]); // 주문 목록 초기화
      // SSE 또는 BroadcastChannel로 NEW_ORDER가 전달될 때 목록이 갱신됨
      // 백엔드 응답에서 orderId를 직접 사용
      const orderNumber = (result as any).data.orderNumber;

      if (orderNumber !== undefined) {
        alert(`주문번호는 ${orderNumber}입니다.`);
      }
    } else {
      alert(result.error || '주문 등록에 실패했습니다.');
    }
  };

  // 주문 상태 변경 함수 (백엔드 연동)
  const handleStatusChange = async (orderId: string, newStatus: 'waiting' | 'processing' | 'completed') => {
    console.log('🔄 주문 상태 변경 시작:', orderId, '->', newStatus);
    
    const result = await updateOrderStatus(orderId, { status: newStatus });

    if (result.success) {
      // SSE를 통해 실시간 업데이트가 올 때까지 기다림 (다른 기기와 동기화)
      console.log(`✅ 주문 ${orderId} 상태를 ${newStatus}로 변경 요청 완료. SSE 업데이트 대기 중...`);
      console.log('🔄 SSE STATUS_CHANGE 이벤트 수신 대기 중...');
    } else {
      console.error('❌ 주문 상태 변경 실패:', result.error);
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

  // 시간 포맷: HH:mm (날짜 제외)
  const formatTimeHM = (dateTime: string) => {
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return dateTime;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          className={`${styles.navButton} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          통계
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
                      <div className={styles.temperatureBadges}>
                        {product.hasIce && <span className={`${styles.badge} ${styles.ice}`}>Ice</span>}
                        {product.hasHot && <span className={`${styles.badge} ${styles.hot}`}>Hot</span>}
                        {!product.hasIce && !product.hasHot && (
                          <span className={`${styles.badge} ${styles.hot}`}>Hot</span>
                        )}
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
                      // if (order.size === 'Large') {
                      //   price += 500; // Large 사이즈 추가 가격
                      // }
                      
                      return (
                        <div key={index} className={styles.orderItem}>
                          <span>
                            {order.name} ({order.temperature}) x {order.amount}
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
                  (selectedStatus === 'completed'
                    ? [...filteredOrders].sort((a, b) => {
                        const ta = (a as any).completedAt || a.orderTime;
                        const tb = (b as any).completedAt || b.orderTime;
                        return new Date(tb).getTime() - new Date(ta).getTime();
                      })
                    : filteredOrders
                  ).map((order) => (
                    <div key={order.orderNumber} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <span className={styles.orderNumber}>{order.orderNumber ?? order.orderId}</span>
                        <span className={styles.orderTime}>{formatTimeHM(order.orderTime)}</span>
                      </div>
                      <div className={styles.orderItems}>
                        {(() => {
                          const aggregated: { [key: string]: { name: string; size: string; temperature: string; amount: number } } = {};
                          for (const item of order.orderItems) {
                            const key = `${item.name}|${item.size}|${item.temperature}`;
                            if (!aggregated[key]) {
                              aggregated[key] = { name: item.name, size: item.size, temperature: item.temperature, amount: 0 };
                            }
                            aggregated[key].amount += item.amount;
                          }
                          return Object.values(aggregated).map((agg, idx) => (
                            <div key={idx}>
                              {agg.name} ({agg.temperature}) x {agg.amount}
                            </div>
                          ));
                        })()}
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
            <MenuAdmin />
          </div>
        )}

        {activeTab === 'stats' && <StatsTab />}
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