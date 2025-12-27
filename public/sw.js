self.addEventListener('install', (e) => {
  console.log('PWA 서비스 워커 설치 완료!');
});

self.addEventListener('fetch', (e) => {
  // 네트워크 요청을 가로채서 처리하는 로직 (일단 비워둬도 작동합니다)
});