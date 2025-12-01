# 🌐 SOOP 엑셀 점수 집계 시스템 - 배포 가이드

24시간 운영되는 웹 서비스로 배포하는 방법을 안내합니다.

## 🚀 배포 옵션 비교

| 플랫폼 | 무료 플랜 | Puppeteer 지원 | 도메인 | 난이도 |
|--------|-----------|----------------|--------|--------|
| **Render.com** | ✅ (슬립 모드) | ⚠️ 제한적 | `*.onrender.com` | ⭐ 쉬움 |
| **Railway.app** | ✅ ($5 크레딧) | ✅ 완전 지원 | `*.railway.app` | ⭐⭐ 보통 |
| **Vercel** | ✅ | ❌ 불가능 | `*.vercel.app` | ⭐ 쉬움 (서버리스만) |
| **Heroku** | ❌ (유료 전환) | ✅ | `*.herokuapp.com` | ⭐⭐ 보통 |
| **VPS (Vultr/DigitalOcean)** | ❌ ($5/월~) | ✅ 완전 지원 | 커스텀 가능 | ⭐⭐⭐ 어려움 |

## 📌 추천: Railway.app (Puppeteer 완벽 지원)

Railway는 Puppeteer를 완벽하게 지원하며, 초기 $5 크레딧을 제공합니다.

### 1️⃣ GitHub 저장소 생성

```bash
# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: SOOP Excel Score Tracker"

# GitHub에 저장소 생성 후 연결
git remote add origin https://github.com/YOUR_USERNAME/soop-excel-tracker.git
git branch -M main
git push -u origin main
```

### 2️⃣ Railway 배포

1. **Railway 가입**: https://railway.app
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. 저장소 선택: `soop-excel-tracker`
5. 자동 배포 시작 ✅

### 3️⃣ 환경 변수 설정 (선택사항)

Railway 대시보드에서:
- `NODE_ENV` = `production`
- `PORT` = `3000` (자동 설정됨)

### 4️⃣ 도메인 확인

배포 완료 후 Railway가 자동으로 도메인 생성:
- 예: `https://soop-excel-tracker.up.railway.app`

### 5️⃣ 커스텀 도메인 연결 (선택사항)

Railway 설정에서 커스텀 도메인 추가 가능:
1. Settings → Domains
2. Custom Domain 입력
3. DNS 설정 (CNAME 레코드)

---

## 🎯 대안 1: Render.com (무료, 제한적)

### 장점
- ✅ 완전 무료
- ✅ 자동 HTTPS
- ✅ GitHub 자동 배포

### 단점
- ⚠️ 15분 비활성 시 슬립 모드
- ⚠️ Puppeteer 메모리 제한 (512MB)

### 배포 방법

1. **Render 가입**: https://render.com
2. **New Web Service** 클릭
3. GitHub 저장소 연결
4. 설정:
   - **Name**: `soop-excel-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Create Web Service** 클릭

배포 완료 후 도메인:
- 예: `https://soop-excel-tracker.onrender.com`

---

## 🎯 대안 2: VPS (완전한 제어)

### 추천 VPS 제공업체
- **Vultr**: $5/월 (1GB RAM)
- **DigitalOcean**: $6/월 (1GB RAM)
- **Contabo**: €4.50/월 (4GB RAM)

### 배포 방법

#### 1. VPS 접속
```bash
ssh root@YOUR_SERVER_IP
```

#### 2. Node.js 설치
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Chrome 의존성 설치 (Puppeteer용)
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

#### 3. 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/soop-excel-tracker.git
cd soop-excel-tracker
npm install
```

#### 4. PM2로 24시간 운영
```bash
# PM2 설치
npm install -g pm2

# 앱 시작
pm2 start server.js --name soop-tracker

# 부팅 시 자동 시작
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs soop-tracker
```

#### 5. Nginx 리버스 프록시 설정
```bash
# Nginx 설치
sudo apt-get install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/soop-tracker
```

설정 내용:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/soop-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL 인증서 (HTTPS)
```bash
# Certbot 설치
sudo apt-get install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

---

## 🌍 무료 도메인 받기

### 1. **Freenom** (무료 .tk, .ml, .ga 도메인)
- https://www.freenom.com
- 최대 12개월 무료

### 2. **DuckDNS** (무료 서브도메인)
- https://www.duckdns.org
- 예: `yourname.duckdns.org`

### 3. **Cloudflare** (DNS 관리)
- 기존 도메인의 DNS를 Cloudflare로 이전
- 무료 CDN + SSL

---

## 📊 배포 후 확인 사항

### ✅ 체크리스트

- [ ] 웹사이트 접속 가능
- [ ] HTTPS 작동 (SSL 인증서)
- [ ] URL 입력 폼 정상 작동
- [ ] 크롤링 요청 성공
- [ ] 스크린샷 캡처 확인
- [ ] 결과 다운로드 가능
- [ ] 모바일 반응형 확인

### 🔍 디버깅

#### 로그 확인
```bash
# Railway
railway logs

# Render
Render 대시보드 → Logs 탭

# VPS (PM2)
pm2 logs soop-tracker
```

#### 일반적인 문제

**1. Puppeteer 실행 실패**
```javascript
// server.js 또는 crawler에 추가
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
});
```

**2. 메모리 부족**
- 캡처 횟수 줄이기
- 브라우저 인스턴스 재사용
- 스크린샷 해상도 낮추기

**3. CORS 에러**
- `server.js`에서 CORS 설정 확인
- 프론트엔드에서 올바른 API URL 사용

---

## 🎉 배포 완료!

배포가 완료되면:

1. **도메인 공유**: 친구들에게 URL 공유
2. **모니터링**: 서버 상태 주기적 확인
3. **업데이트**: GitHub에 푸시하면 자동 재배포

### 예시 URL
- Railway: `https://soop-excel-tracker.up.railway.app`
- Render: `https://soop-excel-tracker.onrender.com`
- 커스텀: `https://soop-tracker.com`

---

## 💡 추가 개선 사항

### 1. 데이터베이스 연동
- PostgreSQL (Railway/Render 무료 제공)
- 과거 집계 기록 저장

### 2. 실시간 업데이트
- WebSocket으로 진행 상황 실시간 전송
- Socket.io 사용

### 3. 사용자 인증
- 로그인 기능 추가
- 개인별 집계 히스토리

### 4. 성능 최적화
- Redis 캐싱
- CDN 사용 (Cloudflare)
- 이미지 압축

---

## 📞 도움이 필요하신가요?

문제가 발생하면:
1. GitHub Issues에 문의
2. 로그 확인 후 에러 메시지 공유
3. 배포 플랫폼 문서 참고

**Happy Deploying! 🚀**
