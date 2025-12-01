// DOM 요소
const urlInput = document.getElementById('url-input');
const startBtn = document.getElementById('start-btn');
const optionsBtn = document.getElementById('options-btn');
const optionsPanel = document.getElementById('options-panel');
const captureCountInput = document.getElementById('capture-count');
const captureIntervalInput = document.getElementById('capture-interval');
const chatDurationInput = document.getElementById('chat-duration');

const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressLogs = document.getElementById('progress-logs');

const resultsSection = document.getElementById('results-section');
const participantCount = document.getElementById('participant-count');
const timestamp = document.getElementById('timestamp');
const resultsTbody = document.getElementById('results-tbody');
const screenshotsGrid = document.getElementById('screenshots-grid');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');

const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const errorRetryBtn = document.getElementById('error-retry-btn');

// API URL 자동 감지 (로컬/배포 환경 모두 지원)
const API_URL = window.location.origin;

// 상태
let currentResults = null;
let isRunning = false;

// 옵션 토글
optionsBtn.addEventListener('click', () => {
    const chevron = optionsBtn.querySelector('.chevron');
    optionsPanel.classList.toggle('open');
    chevron.classList.toggle('open');
});

// 집계 시작
startBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();

    if (!url) {
        alert('방송 URL을 입력해주세요.');
        urlInput.focus();
        return;
    }

    if (!url.includes('soop.tv') && !url.includes('afreecatv.com')) {
        alert('SOOP(아프리카TV) URL을 입력해주세요.');
        urlInput.focus();
        return;
    }

    if (isRunning) {
        alert('이미 집계가 진행 중입니다.');
        return;
    }

    await startCrawling(url);
});

// Enter 키로 시작
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});

// 크롤링 시작
async function startCrawling(url) {
    isRunning = true;

    // UI 초기화
    hideAllSections();
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressLogs.innerHTML = '';

    // 옵션 값 가져오기
    const options = {
        captureCount: parseInt(captureCountInput.value),
        captureInterval: parseInt(captureIntervalInput.value) * 1000,
        chatDuration: parseInt(chatDurationInput.value) * 1000
    };

    try {
        addLog('🚀 서버에 요청 전송 중...');
        updateProgress(5);

        // 백엔드 API 호출
        const response = await fetch(`${API_URL}/api/crawl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, options })
        });

        addLog('✅ 서버 연결 성공');
        updateProgress(10);

        // 진행 상황 시뮬레이션 (실제로는 WebSocket이나 SSE로 실시간 업데이트 가능)
        addLog('📺 방송 페이지 접속 중...');
        updateProgress(20);
        await sleep(2000);

        addLog('🔍 화면 분석 중...');
        updateProgress(30);
        await sleep(1500);

        addLog(`📸 화면 캡처 중 (${options.captureCount}회)...`);
        const captureSteps = options.captureCount;
        for (let i = 0; i < captureSteps; i++) {
            await sleep(options.captureInterval / captureSteps);
            addLog(`  📷 캡처 ${i + 1}/${captureSteps}`);
            updateProgress(30 + (i + 1) * (30 / captureSteps));
        }

        addLog('💬 채팅 모니터링 중...');
        updateProgress(70);
        await sleep(Math.min(options.chatDuration / 3, 3000));

        addLog('🔍 OCR 처리 중...');
        updateProgress(85);
        await sleep(2000);

        addLog('📊 데이터 집계 중...');
        updateProgress(95);

        // 결과 받기
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '서버 오류가 발생했습니다.');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '크롤링 실패');
        }

        updateProgress(100);
        addLog('✅ 집계 완료!');
        await sleep(500);

        showResults(result.data);

    } catch (error) {
        console.error('Error:', error);

        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.\n\n터미널에서 "node server.js"를 실행하세요.';
        }

        showError(errorMsg);
    } finally {
        isRunning = false;
    }
}

// 결과 표시
function showResults(results) {
    currentResults = results;

    hideAllSections();
    resultsSection.style.display = 'block';

    // 메타 정보
    participantCount.textContent = `참가자: ${results.totalParticipants}명`;
    timestamp.textContent = `집계 시간: ${new Date(results.timestamp).toLocaleString('ko-KR')}`;

    // 테이블 생성
    resultsTbody.innerHTML = '';
    results.scores.forEach((item, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div class="rank-cell">
          ${medal ? `<span class="rank-medal">${medal}</span>` : ''}
          <span>${rank}위</span>
        </div>
      </td>
      <td class="name-cell">${escapeHtml(item.name)}</td>
      <td>${item.score.toLocaleString()}점</td>
    `;

        // 애니메이션
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(20px)';
        resultsTbody.appendChild(tr);

        setTimeout(() => {
            tr.style.transition = 'all 0.3s ease-out';
            tr.style.opacity = '1';
            tr.style.transform = 'translateY(0)';
        }, index * 50);
    });

    // 스크린샷
    screenshotsGrid.innerHTML = '';
    if (results.screenshots && results.screenshots.length > 0) {
        results.screenshots.forEach((screenshot, i) => {
            const div = document.createElement('div');
            div.className = 'screenshot-item';
            div.innerHTML = `
        <img src="/screenshots/${screenshot}" alt="Screenshot ${i + 1}">
      `;
            screenshotsGrid.appendChild(div);
        });
    } else {
        // 플레이스홀더
        for (let i = 0; i < 5; i++) {
            const div = document.createElement('div');
            div.className = 'screenshot-item';
            div.innerHTML = `
        <img src="https://via.placeholder.com/400x225/1a1a2e/667eea?text=Screenshot+${i + 1}" alt="Screenshot ${i + 1}">
      `;
            screenshotsGrid.appendChild(div);
        }
    }
}

// 에러 표시
function showError(message) {
    hideAllSections();
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
}

// 모든 섹션 숨기기
function hideAllSections() {
    progressSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// 진행률 업데이트
function updateProgress(percent) {
    progressFill.style.width = `${percent}%`;
}

// 로그 추가
function addLog(message) {
    const p = document.createElement('p');
    p.className = 'log-item';
    p.textContent = message;
    progressLogs.appendChild(p);
    progressLogs.scrollTop = progressLogs.scrollHeight;
}

// 결과 다운로드
downloadBtn.addEventListener('click', () => {
    if (!currentResults) return;

    const dataStr = JSON.stringify(currentResults, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `soop-excel-result-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
});

// 리셋
resetBtn.addEventListener('click', () => {
    hideAllSections();
    currentResults = null;
    urlInput.value = '';
    urlInput.focus();
});

errorRetryBtn.addEventListener('click', () => {
    hideAllSections();
});

// 유틸리티 함수
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 초기화
console.log('🎯 SOOP 엑셀 방송 점수 집계 시스템 준비 완료');
console.log(`📡 API URL: ${API_URL}`);
console.log('📝 URL을 입력하고 "집계 시작" 버튼을 클릭하세요.');
