const SoopExcelCrawler = require('./crawler/soop-excel-crawler');

/**
 * 테스트 실행 스크립트
 * 
 * 사용법:
 * node test-crawler.js <SOOP_URL>
 * 
 * 예시:
 * node test-crawler.js https://play.soop.tv/example123
 */

async function main() {
    // 커맨드 라인에서 URL 받기
    const url = process.argv[2];

    if (!url) {
        console.error('❌ 사용법: node test-crawler.js <SOOP_URL>');
        console.error('예시: node test-crawler.js https://play.soop.tv/example123');
        process.exit(1);
    }

    // URL 유효성 검사
    if (!url.includes('soop.tv') && !url.includes('afreecatv.com')) {
        console.error('❌ SOOP(아프리카TV) URL이 아닙니다.');
        process.exit(1);
    }

    console.log('🎯 SOOP 엑셀 방송 점수 집계 시작\n');
    console.log(`URL: ${url}\n`);

    const crawler = new SoopExcelCrawler();

    try {
        const results = await crawler.run(url, {
            captureCount: 5,        // 5회 캡처
            captureInterval: 3000,  // 3초 간격
            chatDuration: 30000     // 30초간 채팅 모니터링
        });

        console.log('\n✅ 집계 완료!');
        console.log(`총 ${results.totalParticipants}명의 점수를 집계했습니다.`);

        // 브라우저를 10초간 열어둠 (결과 확인용)
        console.log('\n⏳ 10초 후 브라우저를 닫습니다...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        await crawler.close();

    } catch (error) {
        console.error('\n❌ 집계 실패:', error.message);
        await crawler.close();
        process.exit(1);
    }
}

main();
