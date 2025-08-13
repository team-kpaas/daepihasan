// 날씨 위젯 초기화 및 반응형 대응
// 디바운스 함수
function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

// 상태 변수
let cardStepPx = 0;         // 카드 1장의 이동 거리(폭 + gap)
let visibleCards = 3;       // 화면에 보이는 카드 수
let currentIndex = 0;
let totalCards = 0;
let observersSetup = false;

const VIEW_COUNT = 3;   // 목표
let gapPx = 0;         // 실측 gap 저장

// 시간 업데이트
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

// 최초 실행
updateCurrentTime();
{
    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    setTimeout(() => {
        updateCurrentTime();
        setInterval(updateCurrentTime, 60 * 1000);
    }, secondsUntilNextMinute * 1000);
}

function getMaxStartMinusOne() {
    // 총 카드 수 - 한 화면 표시 수
    const raw = totalCards - visibleCards;
    // 보이는 카드 수가 더 많거나 같으면 이동 없음
    return raw > 0 ? raw - 1 : 0;
}

// 카드/슬라이더 치수 재계산
function recalcMetrics() {
    const slider = document.getElementById("weatherSlider");
    const container = slider?.parentElement;
    const firstCard = slider?.querySelector(".weather-card-item");
    if (!slider || !container || !firstCard) return;

    const s = getComputedStyle(slider);
    gapPx = parseFloat(s.columnGap || s.gap || "0") || 0;

    const cardW = firstCard.getBoundingClientRect().width;
    cardStepPx = cardW + gapPx;
    totalCards = slider.children.length;

    // 3장 이상 보이지 않도록 컨테이너 최대폭을 제한
    const targetMax = VIEW_COUNT * cardStepPx - gapPx;
    container.style.maxWidth = `${targetMax}px`;
    container.style.margin = "0 auto";

    // 실제 들어가는 개수(클램프 후 측정값)
    visibleCards = Math.max(1, Math.min(VIEW_COUNT, Math.floor(container.clientWidth / cardStepPx)));

    const maxStart = getMaxStartMinusOne(); // 네가 쓰는 -1 로직이면 -> raw-1
    currentIndex = Math.min(currentIndex, maxStart);

    applyTransformAndButtons();
}

// 버튼 상태와 슬라이드 위치 적용
function applyTransformAndButtons() {
    const slider = document.getElementById("weatherSlider");
    if (!slider || cardStepPx === 0) return;

    const maxStart = getMaxStartMinusOne();
    currentIndex = Math.min(currentIndex, maxStart);

    slider.style.transform = `translateX(-${currentIndex * cardStepPx}px)`;

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    if (nextBtn) nextBtn.style.visibility = currentIndex >= maxStart ? "hidden" : "visible";
}

// 날씨 카드 렌더링
function renderWeather(data) {
    const slider = document.getElementById("weatherSlider");
    if (!slider) return;

    slider.innerHTML = "";
    currentIndex = 0;

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "weather-card-item";
        card.innerHTML = `
            <div>${item.time} 시</div>
            <div class="weather-icon-temp">
                <img src="${item.icon}" alt="날씨 아이콘" title="${item.desc}" />
                <span class="temp-text">${item.temp}°</span>
            </div>
            <div class="weather-text">습도: ${item.reh}%</div>
            <div class="weather-text">${item.windInfo}</div>
            <div class="weather-text">강수: ${item.rn1 || "강수없음"}</div>
        `;
        slider.appendChild(card);
    });

    recalcMetrics();
    setupObserversOnce();
}

// 이전/다음 버튼 이벤트
document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        applyTransformAndButtons();
    }
});
document.getElementById("nextBtn")?.addEventListener("click", () => {
    const maxStart = getMaxStartMinusOne();
    if (currentIndex < maxStart) {
        currentIndex++;
        applyTransformAndButtons();
    }
});

// 날씨 데이터 로드
function loadWeather(lat, lng) {
    fetch(`/weather/get?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(renderWeather)
        .catch(err => console.error("날씨 불러오기 실패", err));
}

// 이벤트/옵저버 설정
function setupObserversOnce() {
    if (observersSetup) return;
    observersSetup = true;

    const debouncedRecalc = debounce(recalcMetrics, 100);
    window.addEventListener("resize", debouncedRecalc);
    window.addEventListener("orientationchange", recalcMetrics);

    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        const mo = new MutationObserver(() => {
            const onEnd = () => {
                recalcMetrics();
                sidebar.removeEventListener("transitionend", onEnd);
            };
            sidebar.addEventListener("transitionend", onEnd, {once: true});
            setTimeout(recalcMetrics, 120);
        });
        mo.observe(sidebar, {attributes: true, attributeFilter: ["class"]});
    }

    const container = document.querySelector(".weather-cards-container");
    if (container && "ResizeObserver" in window) {
        const ro = new ResizeObserver(() => recalcMetrics());
        ro.observe(container);
    }
}

// 페이지 로드 시 위치 기반 날씨 로드
window.addEventListener("DOMContentLoaded", () => {
    if (typeof getCurrentLatLng === "function") {
        getCurrentLatLng(pos => loadWeather(pos.lat, pos.lng));
    }
});
