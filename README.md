# 🎯 SOOP 엑셀 방송 점수 집계 시스템

SOOP(구 아프리카TV) 엑셀 방송의 점수를 자동으로 집계하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🔍 **OCR 기반 점수 인식**: Tesseract.js를 사용하여 화면 속 점수표를 자동 인식
- 💬 **채팅 크롤링**: 채팅창의 점수 정보를 실시간으로 수집
- 🎨 **프리미엄 UI**: 다크 모드 기반의 세련된 인터페이스
- 📊 **실시간 집계**: 여러 데이터 소스를 조합하여 정확도 향상
- 📸 **스크린샷 저장**: 집계 과정의 화면을 자동으로 캡처 및 저장
- 💾 **결과 다운로드**: JSON 형식으로 집계 결과 다운로드 가능

## 🚀 시작하기

### 1. 의존성 설치

이미 설치되어 있습니다:
- puppeteer
- tesseract.js
- express
- cors

### 2. 서버 실행

```bash
node server.js
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 3. 웹 인터페이스 접속

브라우저에서 `http://localhost:3000`을 열어주세요.

### 4. 사용 방법

1. SOOP 방송 URL 입력 (예: `https://play.soop.tv/example123`)
2. 필요시 고급 옵션 조정:
   - 캡처 횟수: 화면을 캡처할 횟수 (기본: 5회)
   - 캡처 간격: 캡처 사이의 대기 시간 (기본: 3초)
   - 채팅 모니터링: 채팅을 모니터링할 시간 (기본: 30초)
3. "집계 시작" 버튼 클릭
4. 결과 확인 및 다운로드

## 📁 프로젝트 구조

```
test/
├── crawler/
│   └── soop-excel-crawler.js    # 핵심 크롤러 로직
├── screenshots/                  # 캡처된 화면 저장 폴더
├── results/                      # 집계 결과 JSON 저장 폴더
├── index.html                    # 웹 인터페이스
├── style.css                     # 스타일시트
├── script.js                     # 프론트엔드 로직
├── server.js                     # Express 서버
├── test-crawler.js               # CLI 테스트 스크립트
└── README.md                     # 이 파일
```

## 🛠️ CLI 모드 사용

웹 인터페이스 없이 커맨드 라인에서 직접 실행할 수도 있습니다:

```bash
node test-crawler.js https://play.soop.tv/example123
```

## 📊 API 엔드포인트

### POST `/api/crawl`

방송 URL을 받아 점수를 집계합니다.

**요청 본문:**
```json
{
  "url": "https://play.soop.tv/example123",
  "options": {
    "captureCount": 5,
    "captureInterval": 3000,
    "chatDuration": 30000
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "totalParticipants": 10,
    "scores": [
      { "name": "BJ이름", "score": 1234567 }
    ],
    "screenshots": ["capture_1234567890.png"],
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

### GET `/api/status`

현재 크롤링 진행 상태를 확인합니다.

**응답:**
```json
{
  "isRunning": false
}
```

## 🎨 기술 스택

### 백엔드
- **Node.js**: 런타임 환경
- **Express**: 웹 서버 프레임워크
- **Puppeteer**: 브라우저 자동화
- **Tesseract.js**: OCR 엔진

### 프론트엔드
- **HTML5**: 구조
- **CSS3**: 스타일링 (그라데이션, 글래스모피즘, 애니메이션)
- **Vanilla JavaScript**: 인터랙션 로직

## 🔧 작동 원리

1. **브라우저 자동화**: Puppeteer로 SOOP 방송 페이지에 접속
2. **화면 캡처**: 일정 간격으로 화면을 캡처하여 이미지로 저장
3. **OCR 처리**: Tesseract.js로 이미지 속 텍스트(점수) 인식
4. **채팅 크롤링**: 채팅창의 메시지에서 점수 정보 추출
5. **데이터 조합**: OCR과 채팅 데이터를 조합하여 정확도 향상
6. **결과 집계**: 최종 점수를 정렬하여 순위 매기기

## ⚠️ 주의사항

- **정확도**: OCR 인식률은 화면 해상도와 폰트에 따라 달라질 수 있습니다.
- **성능**: 브라우저 자동화는 시스템 리소스를 많이 사용합니다.
- **법적 책임**: 이 도구는 개인적인 용도로만 사용하세요. 무단 크롤링은 서비스 약관 위반일 수 있습니다.

## 🐛 문제 해결

### 서버 연결 실패
- 서버가 실행 중인지 확인: `node server.js`
- 포트 3000이 사용 중인지 확인

### OCR 인식 실패
- 화면 해상도를 높여보세요
- 캡처 횟수를 늘려보세요
- 점수표가 화면에 명확하게 보이는지 확인

### 브라우저 실행 실패
- Chrome이 설치되어 있는지 확인
- Puppeteer 재설치: `npm install puppeteer`

## 📝 라이선스

개인 프로젝트용

## 👨‍💻 개발자

Made with ❤️ for SOOP Streamers
