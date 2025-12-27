PWA추가
1. Manifest 파일 생성 (manifest.json)
앱의 이름, 아이콘, 배경색 등을 정의하는 명함 같은 파일입니다. public 폴더나 dist 루트에 만듭니다.
{
  "name": "바이브 보드",
  "short_name": "VibeBoard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/vc-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/vc-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
2. Service Worker 등록 (sw.js)
self.addEventListener('install', (e) => {
  console.log('PWA 서비스 워커 설치 완료!');
});

self.addEventListener('fetch', (e) => {
  // 네트워크 요청을 가로채서 처리하는 로직 (일단 비워둬도 작동합니다)
});
index.html의 <head> 태그 안에 아래 코드를 넣습니다.
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4F46E5">
<script>
  if ('service worker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>