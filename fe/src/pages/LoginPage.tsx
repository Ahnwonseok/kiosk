import { useState } from 'react';
import styles from './LoginPage.module.css';
import { login } from '../api'; // 경로는 실제 위치에 맞게 조정

interface LoginPageProps {
  navigate: (path: string) => void;
}

export default function LoginPage({ navigate }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBaristaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(username, password);
      // JWT 토큰을 localStorage 등에 저장
      localStorage.setItem('jwt', data.token);
      // 필요하다면 사용자 정보도 저장
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);

      // 로그인 성공 시 바리스타 화면으로 이동
      navigate('/barista');
    } catch (err) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKioskAccess = () => {
    // 일반 키오스크 화면으로 이동
    navigate('/kiosk');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>카페 관리 시스템</h1>
          <p className={styles.subtitle}>바리스타 로그인 또는 키오스크 이용</p>
        </div>

        <div className={styles.loginSection}>
          <h2 className={styles.sectionTitle}>바리스타 로그인</h2>
          <form onSubmit={handleBaristaLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                아이디
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? '로그인 중...' : '바리스타 로그인'}
            </button>
          </form>
        </div>

        <div className={styles.divider}>
          <span>또는</span>
        </div>

        <div className={styles.kioskSection}>
          <h2 className={styles.sectionTitle}>일반 고객</h2>
          <p className={styles.kioskDescription}>
            계정이 없으시다면 키오스크를 이용해주세요
          </p>
          <button
            onClick={handleKioskAccess}
            className={styles.kioskButton}
          >
            키오스크 이용하기
          </button>
        </div>

      </div>
    </div>
  );
} 