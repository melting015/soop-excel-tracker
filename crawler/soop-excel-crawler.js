const puppeteer = require('puppeteer');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

class SoopExcelCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.scores = new Map(); // BJ명 -> 점수
    this.screenshots = [];
  }

  /**
   * 브라우저 초기화
   */
  async init() {
    console.log('🚀 브라우저 초기화 중...');
    this.browser = await puppeteer.launch({
      headless: false, // 디버깅을 위해 브라우저 보이게
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    this.page = await this.browser.newPage();
    
    // User-Agent 설정
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  /**
   * SOOP 방송 페이지 접속
   */
  async navigateToStream(url) {
    console.log(`📺 방송 페이지 접속: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 페이지 로딩 대기
    await this.page.waitForTimeout(3000);
    
    console.log('✅ 페이지 로딩 완료');
  }

  /**
   * 화면 캡처 및 OCR로 점수 추출
   */
  async captureAndExtractScores(captureCount = 5, interval = 3000) {
    console.log(`📸 화면 캡처 시작 (${captureCount}회, ${interval}ms 간격)`);
    
    const screenshotDir = path.join(__dirname, '../screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });

    for (let i = 0; i < captureCount; i++) {
      const timestamp = Date.now();
      const screenshotPath = path.join(screenshotDir, `capture_${timestamp}.png`);
      
      // 전체 화면 캡처
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: false 
      });
      
      console.log(`  📷 캡처 ${i + 1}/${captureCount}: ${screenshotPath}`);
      this.screenshots.push(screenshotPath);
      
      // OCR 처리
      await this.processScreenshotWithOCR(screenshotPath);
      
      if (i < captureCount - 1) {
        await this.page.waitForTimeout(interval);
      }
    }
  }

  /**
   * OCR로 이미지에서 텍스트 추출
   */
  async processScreenshotWithOCR(imagePath) {
    try {
      console.log(`  🔍 OCR 처리 중: ${path.basename(imagePath)}`);
      
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'kor+eng', // 한글 + 영어
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              process.stdout.write(`\r    진행률: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('\n    ✅ OCR 완료');
      
      // 점수 패턴 추출 (예: "홍길동 1,234,567" 또는 "김철수: 987,654")
      this.extractScoresFromText(text);
      
    } catch (error) {
      console.error(`  ❌ OCR 실패: ${error.message}`);
    }
  }

  /**
   * 텍스트에서 점수 패턴 추출
   */
  extractScoresFromText(text) {
    // 패턴 1: "이름 숫자" 형태 (예: "홍길동 1234567")
    const pattern1 = /([가-힣a-zA-Z0-9_]+)\s*[:：]?\s*([\d,]+)/g;
    
    let match;
    while ((match = pattern1.exec(text)) !== null) {
      const name = match[1].trim();
      const scoreStr = match[2].replace(/,/g, '');
      const score = parseInt(scoreStr);
      
      // 유효한 점수인지 확인 (너무 작거나 큰 숫자 제외)
      if (!isNaN(score) && score >= 0 && score < 100000000) {
        // 기존 점수보다 크면 업데이트
        if (!this.scores.has(name) || this.scores.get(name) < score) {
          this.scores.set(name, score);
          console.log(`    💰 점수 발견: ${name} = ${score.toLocaleString()}`);
        }
      }
    }
  }

  /**
   * 채팅창에서 점수 정보 크롤링
   */
  async monitorChatForScores(duration = 30000) {
    console.log(`💬 채팅 모니터링 시작 (${duration / 1000}초)`);
    
    try {
      // 채팅 영역 찾기 (SOOP의 채팅 구조에 맞게 조정 필요)
      const chatSelectors = [
        '#chat_area',
        '.chat_message',
        '[class*="chat"]',
        'iframe[title*="채팅"]'
      ];

      let chatFound = false;
      for (const selector of chatSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          console.log(`  ✅ 채팅 영역 발견: ${selector}`);
          chatFound = true;
          break;
        }
      }

      if (!chatFound) {
        console.log('  ⚠️ 채팅 영역을 찾을 수 없습니다. 페이지 구조 확인 필요');
      }

      // 채팅 메시지 감지 (실제 구현은 페이지 구조에 따라 조정 필요)
      const startTime = Date.now();
      while (Date.now() - startTime < duration) {
        try {
          const chatText = await this.page.evaluate(() => {
            const chatElements = document.querySelectorAll('[class*="chat"], .message, .chat_message');
            return Array.from(chatElements)
              .slice(-50) // 최근 50개 메시지만
              .map(el => el.textContent)
              .join('\n');
          });

          if (chatText) {
            this.extractScoresFromText(chatText);
          }
        } catch (e) {
          // 페이지 구조가 다를 수 있으므로 에러 무시
        }

        await this.page.waitForTimeout(2000);
      }

      console.log('✅ 채팅 모니터링 완료');
    } catch (error) {
      console.error(`❌ 채팅 모니터링 실패: ${error.message}`);
    }
  }

  /**
   * 최종 결과 반환
   */
  getResults() {
    const results = Array.from(this.scores.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score); // 점수 높은 순 정렬

    return {
      totalParticipants: results.length,
      scores: results,
      screenshots: this.screenshots,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 결과를 JSON 파일로 저장
   */
  async saveResults() {
    const results = this.getResults();
    const outputPath = path.join(__dirname, '../results', `result_${Date.now()}.json`);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    
    console.log(`\n💾 결과 저장 완료: ${outputPath}`);
    return outputPath;
  }

  /**
   * 결과 출력
   */
  printResults() {
    const results = this.getResults();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 엑셀 방송 점수 집계 결과');
    console.log('='.repeat(60));
    console.log(`참가자 수: ${results.totalParticipants}명`);
    console.log(`집계 시간: ${new Date(results.timestamp).toLocaleString('ko-KR')}`);
    console.log('-'.repeat(60));
    
    if (results.scores.length === 0) {
      console.log('⚠️ 점수 데이터를 찾지 못했습니다.');
      console.log('   - 화면에 점수표가 표시되어 있는지 확인해주세요.');
      console.log('   - OCR 인식률을 높이려면 화질이 선명해야 합니다.');
    } else {
      results.scores.forEach((item, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
        console.log(`${medal} ${rank}위: ${item.name.padEnd(20)} ${item.score.toLocaleString().padStart(15)}점`);
      });
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * 종료
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('👋 브라우저 종료');
    }
  }

  /**
   * 전체 프로세스 실행
   */
  async run(url, options = {}) {
    const {
      captureCount = 5,
      captureInterval = 3000,
      chatDuration = 30000
    } = options;

    try {
      await this.init();
      await this.navigateToStream(url);
      
      // 병렬 처리: 화면 캡처 + 채팅 모니터링
      await Promise.all([
        this.captureAndExtractScores(captureCount, captureInterval),
        this.monitorChatForScores(chatDuration)
      ]);
      
      this.printResults();
      await this.saveResults();
      
      return this.getResults();
    } catch (error) {
      console.error('❌ 에러 발생:', error);
      throw error;
    } finally {
      // await this.close(); // 디버깅을 위해 주석 처리 (수동으로 닫기)
    }
  }
}

module.exports = SoopExcelCrawler;
