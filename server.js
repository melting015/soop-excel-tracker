const express = require('express');
const cors = require('cors');
const path = require('path');
const SoopExcelCrawler = require('./crawler/soop-excel-crawler');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 정적 파일 제공

// 현재 실행 중인 크롤러 인스턴스
let activeCrawler = null;

/**
 * 메인 페이지
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * 크롤링 시작 API
 */
app.post('/api/crawl', async (req, res) => {
    const { url, options = {} } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL이 필요합니다.' });
    }

    // SOOP URL 유효성 검사 (라이브 + VOD)
    const validDomains = [
        'soop.tv',
        'sooplive.co.kr',
        'afreecatv.com'
    ];

    const isValidUrl = validDomains.some(domain => url.includes(domain));

    if (!isValidUrl) {
        return res.status(400).json({
            error: 'SOOP(아프리카TV) URL만 지원합니다.',
            examples: [
                '라이브: https://play.sooplive.co.kr/bjid/123456',
                'VOD: https://vod.sooplive.co.kr/player/123456'
            ]
        });
    }

    if (activeCrawler) {
        return res.status(409).json({ error: '이미 크롤링이 진행 중입니다.' });
    }

    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎯 새로운 크롤링 요청`);
        console.log(`URL: ${url}`);
        console.log(`옵션:`, options);
        console.log('='.repeat(60) + '\n');

        activeCrawler = new SoopExcelCrawler();

        // 크롤링 실행 (비동기)
        const results = await activeCrawler.run(url, {
            captureCount: options.captureCount || 5,
            captureInterval: options.captureInterval || 3000,
            chatDuration: options.chatDuration || 30000
        });

        // 결과 반환
        res.json({
            success: true,
            data: results
        });

        console.log('\n✅ 크롤링 완료 및 결과 전송\n');

    } catch (error) {
        console.error('\n❌ 크롤링 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '크롤링 중 오류가 발생했습니다.'
        });
    } finally {
        if (activeCrawler) {
            await activeCrawler.close();
            activeCrawler = null;
        }
    }
});

/**
 * 크롤링 상태 확인 API
 */
app.get('/api/status', (req, res) => {
    res.json({
        isRunning: activeCrawler !== null
    });
});

/**
 * 스크린샷 제공 API
 */
app.get('/screenshots/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'screenshots', filename);
    res.sendFile(filepath);
});

/**
 * 결과 파일 제공 API
 */
app.get('/results/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'results', filename);
    res.sendFile(filepath);
});

/**
 * 헬스 체크
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SOOP 엑셀 방송 점수 집계 서버 시작');
    console.log('='.repeat(60));
    console.log(`📍 서버 주소: http://localhost:${PORT}`);
    console.log(`📊 웹 인터페이스: http://localhost:${PORT}`);
    console.log(`🔌 API 엔드포인트: http://localhost:${PORT}/api/crawl`);
    console.log('='.repeat(60) + '\n');
    console.log('💡 사용 방법:');
    console.log('   1. 브라우저에서 http://localhost:3000 접속');
    console.log('   2. SOOP 방송 URL 입력 (라이브 또는 VOD)');
    console.log('   3. "집계 시작" 버튼 클릭');
    console.log('   4. 결과 확인\n');
    console.log('📝 지원 URL:');
    console.log('   - 라이브: https://play.sooplive.co.kr/bjid/123456');
    console.log('   - VOD: https://vod.sooplive.co.kr/player/123456\n');
});

// 종료 처리
process.on('SIGINT', async () => {
    console.log('\n\n👋 서버 종료 중...');
    if (activeCrawler) {
        await activeCrawler.close();
    }
    process.exit(0);
});
