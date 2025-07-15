import { useState } from 'react';
import styles from './BaristaPage.module.css';

interface BaristaPageProps {
  navigate: (path: string) => void;
}

export default function BaristaPage({ navigate }: BaristaPageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');

  const handleLogout = () => {
    // 로그아웃 처리 (실제로는 세션/토큰 삭제)
    navigate('/');
  };

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
          <div className={styles.tabContent}>
            <h2>주문 관리</h2>
            <p>주문 목록과 상태 관리 기능이 여기에 들어갈 예정입니다.</p>
            <div className={styles.placeholder}>
              <p>🚧 주문 관리 기능 개발 중 🚧</p>
              <p>주문 목록, 주문 상태 변경, 완료 처리 등의 기능이 추가될 예정입니다.</p>
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
    </div>
  );
} 