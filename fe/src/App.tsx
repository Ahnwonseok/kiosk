import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from 'pages/Home';
import ReceiptPage from 'pages/ReceiptPage';
import LoginPage from 'pages/LoginPage';
import BaristaPage from 'pages/BaristaPage';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/barista" element={<BaristaRoute />} />
          <Route path="/kiosk" element={<KioskRoute />} />
          <Route path="/receipt/orderId/:orderId" element={<ReceiptRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage navigate={navigate} />;
}

function BaristaRoute() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // JWT 토큰 확인
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, []);

  // 로딩 중
  if (isAuthenticated === null) {
    return null;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <BaristaPage navigate={navigate} />;
}

function KioskRoute() {
  const navigate = useNavigate();
  return <Home navigate={navigate} />;
}

function ReceiptRoute() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // orderId 유효성 검사
  if (!orderId || isNaN(Number(orderId))) {
    return <NotFoundPage />;
  }
  
  return <ReceiptPage orderId={Number(orderId)} goHome={() => navigate('/kiosk')} />;
}

function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '20px'
    }}>
      <h1>404 - 페이지를 찾을 수 없습니다</h1>
      <p>요청하신 페이지가 존재하지 않습니다.</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}