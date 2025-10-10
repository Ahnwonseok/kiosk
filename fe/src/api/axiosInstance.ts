import axios from 'axios';
import { BASE_API_DOMAIN } from './config';

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: BASE_API_DOMAIN.toString(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 JWT Token Check:', `Token exists (${token.substring(0, 20)}...)`);
    } else {
      console.log('🔍 JWT Token Check: No token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      const message = error.response.data?.message || error.response.statusText;
      console.error(`HTTP ${error.response.status}:`, message);
      return Promise.reject(new Error(`HTTP ${error.response.status}: ${message}`));
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error('No response received:', error.request);
      return Promise.reject(new Error('서버로부터 응답을 받지 못했습니다.'));
    } else {
      // 요청 설정 중 오류 발생
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

