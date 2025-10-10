// 브라우저가 실행되는 호스트와 동일한 호스트의 백엔드 API 사용
// 로컬: localhost:3030 → localhost:9090
// 외부: 192.168.x.x:3030 → 192.168.x.x:9090
const hostname = window.location.hostname;
export const BASE_API_DOMAIN = new URL(`http://${hostname}:9090`);

// 개발 시 특정 IP 사용하려면 아래 주석 해제
// export const BASE_API_DOMAIN = new URL(`http://localhost:9090`);
// export const BASE_API_DOMAIN = new URL(`http://192.168.x.x:9090`);

