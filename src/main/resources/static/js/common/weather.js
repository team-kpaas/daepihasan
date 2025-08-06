// 날씨 위젯 초기화
function loadWeather(x, y) {
    fetch(`/api/weather?x=${x}&y=${y}`)
        .then(res => res.json())
        .then(data => {
            renderWeather(data);
        })
        .catch(err => console.error("❌ 날씨 불러오기 실패", err));
}

function updateCurrentTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const isAm = hours < 12;

    const period = isAm ? "오전" : "오후";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0시는 12시로 표시

    const formatted = `${year}. ${month}. ${date}. ${period} ${String(hours).padStart(2, "0")}:${minutes}`;
    document.getElementById("current-time").innerText = formatted;
}

// 페이지 로딩 시 최초 실행
updateCurrentTime();

// 현재 초를 기준으로 다음 정각(분)까지 남은 시간 계산
const now = new Date();
const secondsUntilNextMinute = 60 - now.getSeconds();

// 1회성 타이머: 정각까지 기다린 뒤 실행
setTimeout(() => {
    updateCurrentTime(); // 정각에 한 번 실행

    // setInterval: 1분마다 반복 실행
    // 매 정각(분)이 바뀔 때마다 updateCurrentTime()을 실행
    setInterval(updateCurrentTime, 60 * 1000);

}, secondsUntilNextMinute * 1000); // 정각까지 남은 초를 밀리초로 변환


// 슬라이드 관련
let cardWidth = 0;
const visibleCards = 3;
let currentIndex = 0;
let totalCards = 0;

function getCardWidth() {
    const firstCard = document.querySelector(".weather-card-item");
    const cardStyles = window.getComputedStyle(firstCard);
    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(cardStyles.marginRight || cardStyles.gap || "0"); // fallback

    // gap이 카드 사이에만 있으므로 마지막 카드 제외
    const parentStyles = window.getComputedStyle(firstCard.parentElement);
    const actualGap = parseInt(parentStyles.gap || "0");

    return cardWidth + actualGap;
}

function renderWeather(data) {
    const container = document.getElementById("weatherSlider");

    if (!container) return;

    container.innerHTML = "";
    totalCards = data.length;
    currentIndex = 0; // 초기화

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "weather-card-item";
        card.innerHTML = `
            <div>${item.time} 시</div>
            <div class="weather-icon-temp">
                <img src="${item.icon}" alt="날씨 아이콘" title="${item.desc}" />
                <span class="temp-text">${item.temp}°</span>
            </div>
            <div>습도: ${item.reh}%</div>
            <div>${item.windInfo}</div>
            <div>강수: ${item.rn1 || "강수없음"}</div>
        `;
        container.appendChild(card);
    });

    updateSlide(); // 초기 위치 적용
}

function updateSlide() {
    if (cardWidth === 0) {
        cardWidth = getCardWidth();
    }

    const slider = document.getElementById("weatherSlider");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    // 버튼 숨김 조건
    prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    nextBtn.style.visibility = currentIndex >= totalCards - visibleCards ? "hidden" : "visible";
}

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlide();
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentIndex < totalCards - 3) {
        currentIndex++;
        updateSlide();
    }
});

// 위치 기반 날씨 진입
window.addEventListener("DOMContentLoaded", () => {
    if (typeof getCurrentXY === "function") {
        getCurrentXY((xy) => {
            loadWeather(xy.x, xy.y);
        });
    }
});
