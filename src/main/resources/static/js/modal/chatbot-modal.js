// 챗봇 모달 열기/닫기
const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotModal = document.getElementById('chatbotModal');
const chatbotModalClose = document.getElementById('chatbotModalClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotChatArea = document.getElementById('chatbotChatArea');

// 모달 열기
chatbotBtn.addEventListener('click', () => {
    chatbotModal.style.display = 'flex';
    setTimeout(() => chatbotInput.focus(), 200);
});
// 모달 닫기
chatbotModalClose.addEventListener('click', () => chatbotModal.style.display = 'none');
chatbotModal.addEventListener('click', (e) => {
    if (e.target === chatbotModal) chatbotModal.style.display = 'none';
});

// 마크다운 **굵게** 변환 함수
function parseMarkdown(text) {
    // **텍스트**를 <b>텍스트</b>로 변환, 줄바꿈을 <br>로 변환, URL을 <a>로 변환
    let html = text
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/(?:\r\n|\r|\n)/g, '<br>');
    // URL 변환 (http/https로 시작하는 문자열)
    html = html.replace(/(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>|[^<>]*<\/a>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
}

// 메시지 출력 함수
function appendMsg(msg, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-msg ' + sender;
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble';
    bubble.innerHTML = parseMarkdown(msg); // 마크다운 변환 적용
    msgDiv.appendChild(bubble);
    chatbotChatArea.appendChild(msgDiv);
    chatbotChatArea.scrollTop = chatbotChatArea.scrollHeight;
}

// 챗봇 API 호출
async function sendToChatbot(question) {
    appendMsg(question, 'user');
    chatbotInput.value = '';
    appendMsg('답변을 불러오는 중...', 'bot');
    try {
        const res = await fetch('/chat/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        // 마지막 '로딩' 메시지 제거 후 답변 출력
        const loading = chatbotChatArea.querySelector('.chatbot-msg.bot:last-child');
        if (loading) chatbotChatArea.removeChild(loading);
        appendMsg(data.answer, 'bot');
    } catch (e) {
        const loading = chatbotChatArea.querySelector('.chatbot-msg.bot:last-child');
        if (loading) chatbotChatArea.removeChild(loading);
        appendMsg('챗봇 서버와 통신에 실패했습니다.', 'bot');
    }
}

// 전송 버튼/엔터키 이벤트
function trySend() {
    const q = chatbotInput.value.trim();
    if (q) sendToChatbot(q);
}
chatbotSendBtn.addEventListener('click', trySend);
chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') trySend();
});

// 모달 열릴 때 대화창 초기화(원하면)
chatbotModal.addEventListener('transitionend', () => {
    if (chatbotModal.style.display === 'flex') chatbotChatArea.scrollTop = chatbotChatArea.scrollHeight;
});