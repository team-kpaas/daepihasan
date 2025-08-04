// 날씨 위젯 초기화
function loadWeather(x, y) {
    fetch(`/api/weather?x=${x}&y=${y}`)
        .then(res => res.json())
        .then(data => {
            renderWeather(data);
        })
        .catch(err => console.error("❌ 날씨 불러오기 실패", err));
}

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
    const dateLabel = document.getElementById("weather-date-label");

    if (!container || !dateLabel) return;

    const now = new Date();
    dateLabel.textContent = now.toLocaleString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: true
    });

    container.innerHTML = "";
    totalCards = data.length;
    currentIndex = 0; // 초기화

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "weather-card-item";
        card.innerHTML = `
            <div>${item.time}시</div>
            <img src="${item.icon}" alt="날씨 아이콘" />
            <div>${item.temp}°</div>
            <div>${item.desc}</div>
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
