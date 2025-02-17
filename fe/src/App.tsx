import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Home from 'pages/Home';
import ReceiptPage from 'pages/ReceiptPage';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/receipt/orderId/:orderId" element={<ReceiptPage2 />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  return <Home navigate={navigate} />;
}

function ReceiptPage2() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  return <ReceiptPage orderId={Number(orderId)} goHome={() => navigate('/')} />;
}
