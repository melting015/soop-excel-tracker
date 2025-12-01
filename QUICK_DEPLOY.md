# 🚀 빠른 배포 가이드

Git이 설치되어 있지 않은 경우를 위한 간단한 배포 방법입니다.

## 방법 1: Railway.app (가장 추천! Puppeteer 완벽 지원)

### 1단계: Git 설치 (필수)

**Windows:**
1. https://git-scm.com/download/win 에서 다운로드
2. 설치 후 PowerShell 재시작

### 2단계: GitHub 저장소 생성

1. https://github.com 에서 로그인
2. 우측 상단 `+` → `New repository` 클릭
3. Repository name: `soop-excel-tracker`
4. Public 선택
5. `Create repository` 클릭

### 3단계: 코드 업로드

PowerShell에서 실행:

```powershell
# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub 연결 (YOUR_USERNAME을 본인 GitHub 아이디로 변경)
git remote add origin https://github.com/YOUR_USERNAME/soop-excel-tracker.git

# 푸시
git branch -M main
git push -u origin main
```

### 4단계: Railway 배포

1. https://railway.app 접속
2. `Login with GitHub` 클릭
3. `New Project` 클릭
4. `Deploy from GitHub repo` 선택
5. `soop-excel-tracker` 저장소 선택
6. 자동 배포 시작! ✅

### 5단계: 도메인 확인

배포 완료 후 (약 3-5분):
- Settings → Domains 탭에서 도메인 확인
- 예: `https://soop-excel-tracker.up.railway.app`

---

## 방법 2: Render.com (무료, 슬립 모드 있음)

### 1-3단계: 위와 동일 (GitHub 업로드)

### 4단계: Render 배포

1. https://render.com 접속
2. `Get Started for Free` 클릭
3. GitHub 연동
4. `New +` → `Web Service` 클릭
5. 저장소 선택: `soop-excel-tracker`
6. 설정:
   - **Name**: `soop-excel-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
7. `Create Web Service` 클릭

### 5단계: 도메인 확인

배포 완료 후:
- 예: `https://soop-excel-tracker.onrender.com`

**주의**: 15분 비활성 시 슬립 모드 진입 (첫 요청 시 30초 소요)

---

## 방법 3: Git 없이 배포 (Render)

GitHub 없이 직접 업로드:

1. https://render.com 접속
2. `New +` → `Web Service` 클릭
3. `Public Git repository` 선택
4. 임시 GitHub 저장소 생성 후 URL 입력
5. 위와 동일하게 설정

---

## 🎯 배포 후 할 일

### 1. 프론트엔드 API URL 수정

배포된 도메인으로 API URL 변경이 필요합니다.

**script.js 수정:**

```javascript
// 기존
const response = await fetch('http://localhost:3000/api/crawl', {

// 변경 (배포된 도메인으로)
const response = await fetch('https://YOUR-APP.up.railway.app/api/crawl', {
```

또는 자동 감지:

```javascript
const API_URL = window.location.origin;
const response = await fetch(`${API_URL}/api/crawl`, {
```

### 2. 변경사항 재배포

```bash
git add .
git commit -m "Update API URL"
git push
```

Railway/Render가 자동으로 재배포합니다!

---

## 💰 비용

### Railway
- **무료 크레딧**: $5 (약 500시간)
- **이후**: $5/월 (Hobby Plan)
- **Puppeteer**: ✅ 완벽 지원

### Render
- **무료 플랜**: 영구 무료
- **제한**: 15분 슬립, 512MB RAM
- **Puppeteer**: ⚠️ 제한적

### 추천
**Railway**를 추천합니다! Puppeteer가 안정적으로 작동하며, $5로 한 달 이상 사용 가능합니다.

---

## 🆓 완전 무료로 운영하려면?

### 옵션 1: Render 무료 플랜 + Keep-Alive 서비스

Render 무료 플랜의 슬립 모드를 방지:

1. https://uptimerobot.com 가입
2. 모니터 추가: 배포된 URL
3. 5분마다 자동 핑 → 슬립 방지

### 옵션 2: Oracle Cloud (영구 무료)

- **무료 VM**: 1GB RAM
- **영구 무료**: 평생 무료
- **설정**: VPS 배포 가이드 참고 (DEPLOYMENT.md)

---

## 📱 모바일에서 접속

배포 완료 후 스마트폰에서도 접속 가능:
- `https://your-app.up.railway.app`

---

## ❓ 자주 묻는 질문

**Q: Git을 꼭 써야 하나요?**
A: 네, 대부분의 배포 플랫폼은 Git을 사용합니다. 5분이면 설치 가능합니다!

**Q: 도메인 이름을 바꿀 수 있나요?**
A: Railway/Render 설정에서 변경 가능하거나, 커스텀 도메인 연결 가능합니다.

**Q: 무료로 계속 쓸 수 있나요?**
A: Render는 영구 무료(슬립 모드), Railway는 $5 크레딧 소진 후 유료입니다.

**Q: Puppeteer가 작동하지 않아요**
A: Railway를 사용하세요. Render는 메모리 제한으로 불안정할 수 있습니다.

---

## 🎉 완료!

배포가 완료되면 전 세계 어디서나 접속 가능한 웹사이트가 됩니다!

**다음 단계:**
1. 친구들에게 URL 공유
2. 실제 SOOP 방송 URL로 테스트
3. 피드백 받고 개선

**Happy Deploying! 🚀**
