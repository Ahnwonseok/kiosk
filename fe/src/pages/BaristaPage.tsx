import { useState, useRef } from 'react';
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator';
import OrderModal from 'components/Modal/OrderModal';
import useProducts from 'hooks/useProducts';
import { formatAllCategories } from 'utils';
import { CategoryInfo, ProductInfo, ProductOrder } from './types';
import useOutsideClick from '../hooks/useOutsideClick';
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
    // 주문 추가 로직
    setOrderList(prev => [...prev, menuOrder]);
    closeOrderModal();
  };

  const handleMenuClick = (product: ProductInfo) => {
    setSelectedMenu(product);
    openOrderModal();
  };

  // 주문 삭제 함수
  const handleRemoveOrder = (index: number) => {
    setOrderList(prev => prev.filter((_, i) => i !== index));
  };

  // 주문 등록 함수
  const handleConfirmOrder = () => {
    if (orderList.length === 0) return;
    
    // 실제 주문 등록 로직 (API 호출 등)
    console.log('주문 등록:', orderList);
    
    // 주문 목록 초기화
    setOrderList([]);
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
                            onClick={() => handleRemoveOrder(index)}
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
                <button className={styles.statusTab}>대기 (3)</button>
                <button className={styles.statusTab}>진행중 (2)</button>
                <button className={styles.statusTab}>완료 (5)</button>
              </div>

              <div className={styles.orderList}>
                <div className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNumber}>#001</span>
                    <span className={styles.orderTime}>14:30</span>
                  </div>
                  <div className={styles.orderItems}>
                    <div>아메리카노 x 1</div>
                    <div>카페라떼 x 2</div>
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.actionButton}>진행중</button>
                    <button className={styles.actionButton}>완료</button>
                  </div>
                </div>

                <div className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNumber}>#002</span>
                    <span className={styles.orderTime}>14:25</span>
                  </div>
                  <div className={styles.orderItems}>
                    <div>에스프레소 x 1</div>
                    <div>바닐라라떼 x 1</div>
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.actionButton}>진행중</button>
                    <button className={styles.actionButton}>완료</button>
                  </div>
                </div>

                <div className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNumber}>#003</span>
                    <span className={styles.orderTime}>14:20</span>
                  </div>
                  <div className={styles.orderItems}>
                    <div>카푸치노 x 1</div>
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.actionButton}>진행중</button>
                    <button className={styles.actionButton}>완료</button>
                  </div>
                </div>
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