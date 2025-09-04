# Kiosk Backend with JWT Authentication

이 프로젝트는 JWT(JSON Web Token)를 활용한 로그인 기능이 구현된 키오스크 백엔드 애플리케이션입니다.

## 주요 기능

- JWT 기반 인증/인가
- 사용자 회원가입/로그인
- Spring Security를 통한 보안 설정
- BCrypt를 통한 비밀번호 암호화

## API 엔드포인트 

### 인증 관련 API

#### 1. 회원가입
```
POST /api/auth/signup
Content-Type: application/json

{
    "username": "testuser",
    "password": "1234",
    "name": "테스트 사용자",
    "email": "test@example.com"
}
```

#### 2. 로그인
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "1234"
}
```

응답:
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "username": "testuser",
    "name": "테스트 사용자",
    "role": "USER"
}
```

#### 3. 현재 사용자 정보 조회
```
GET /api/auth/me
Authorization: Bearer {token}
```

### 보호된 API 사용법

인증이 필요한 API를 호출할 때는 Authorization 헤더에 JWT 토큰을 포함해야 합니다:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## 테스트 계정

애플리케이션 실행 시 자동으로 생성되는 테스트 계정:

1. **관리자 계정**
   - Username: `admin`
   - Password: `1234`
   - Role: `ADMIN`

2. **일반 사용자 계정**
   - Username: `user`
   - Password: `1234`
   - Role: `USER`

## 설정

### JWT 설정 (application.yml)
```yaml
jwt:
  secret: your-secret-key-here-make-it-long-and-secure-at-least-256-bits
  expiration: 86400000 # 24시간 (밀리초)
```

### 데이터베이스 설정
- MariaDB 사용
- 데이터베이스명: `kiosk2`
- 사용자 테이블 자동 생성

## 보안 설정

- `/api/auth/**`: 인증 없이 접근 가능
- `/api/products/**`: 인증 없이 접근 가능
- `/api/categories/**`: 인증 없이 접근 가능
- 기타 모든 엔드포인트: 인증 필요

## 실행 방법

1. MariaDB 서버 실행
2. `kiosk2` 데이터베이스 생성
3. 애플리케이션 실행
4. 테스트 계정으로 로그인하여 JWT 토큰 발급

## 의존성

- Spring Boot 3.2.2
- Spring Security
- Spring Data JPA
- JWT (jjwt 0.12.3)
- MariaDB Connector
- Lombok 
- test