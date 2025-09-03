// =================== map.js (with recents) ===================

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const peekBtn = document.querySelector(".side-peek");
    const open = !sidebar?.classList.contains("show");
    if (!sidebar || !peekBtn) return;
    sidebar.classList.toggle("show", open);
    peekBtn.classList.toggle("open", open);
}

// ---- 전역 상태 ----
let tmapMap;
let suggestEl;
let searchInput;
let aborter = null;
let activeIndex = -1;
let currentItems = [];
let poiMarker = null;

const HISTORY_KEY = 'mapRecentSearches';
const MAX_HISTORY = 10;

// ---- 컨텍스트패스 (정적 JS에서는 JSP EL이 안 먹음) ----
const contextPath = (() => {
    const m = document.querySelector('meta[name="ctx"]');
    return (m && m.content) || '';
})();
const API_SEARCH = contextPath + '/api/map/search';

// ---- 최근 검색 유틸 ----
function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
}
function saveHistoryTerm(term) {
    term = (term || '').trim();
    if (!term) return;
    let arr = loadHistory().filter(t => t.toLowerCase() !== term.toLowerCase());
    arr.unshift(term);
    if (arr.length > MAX_HISTORY) arr = arr.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}
function removeHistoryTerm(term) {
    let arr = loadHistory().filter(t => t !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}
function clearHistoryIfEmpty(render = true) {
    if (!loadHistory().length) hideSuggest();
    else if (render) renderHistory();
}

// ---- 자동완성/최근기록 셋업 ----
function setupSearchSuggest() {
    searchInput = document.getElementById('mapSearchInput')
        || document.querySelector('.map-search-form input[type="search"]');
    suggestEl   = document.getElementById('searchSuggest')
        || document.querySelector('.map-search-form .search-suggest');
    const searchBtn = document.getElementById('mapSearchBtn')
        || document.querySelector('.map-search-form button[type="button"], .map-search-form button');

    if (!searchInput || !suggestEl) {
        console.warn('검색 UI 요소를 찾을 수 없습니다. (input/ul id 확인)');
        return;
    }

    const debounced = debounce(async (q) => {
        if (q.length < 2) { renderHistory(); return; } // 2자 미만 → 최근기록 보여주기
        await fetchSuggest(q);
    }, 200);

    // 포커스: 입력값이 짧으면 최근기록 노출
    searchInput.addEventListener('focus', () => {
        const q = searchInput.value.trim();
        if (q.length < 2) renderHistory();
    });

    // 입력
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        debounced(q);
    });

    // 포커스 아웃: 살짝 딜레이 후 숨김(클릭 처리 먼저)
    searchInput.addEventListener('blur', () => setTimeout(hideSuggest, 120));

    // 키보드 탐색
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestEl.classList.contains('show')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault(); moveActive(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); moveActive(-1);
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0) {
                e.preventDefault();
                // 제안/최근 공통 처리: 클릭과 동일하게 data-*로 분기
                const li = suggestEl.querySelectorAll('li')[activeIndex];
                if (!li) return;
                if (li.classList.contains('recent-item')) {
                    const term = li.getAttribute('data-term');
                    chooseRecent(term);
                } else {
                    const idx = Number(li.getAttribute('data-idx'));
                    chooseItem(currentItems[idx]);
                }
            }
        } else if (e.key === 'Escape') {
            hideSuggest();
        }
    });

    // 검색 버튼: 입력어로 검색 수행 (제안 없으면 직접 호출)
    searchBtn?.addEventListener('click', async () => {
        const q = (searchInput.value || '').trim();
        if (!q) return;
        saveHistoryTerm(q);
        await fetchSuggest(q);
        // 제안이 있으면 첫번째로 이동
        if (currentItems.length) chooseItem(currentItems[0]);
    });
}

// ---- 백엔드 프록시 호출 ----
async function fetchSuggest(q) {
    if (aborter) aborter.abort();
    aborter = new AbortController();

    const center = tmapMap?.getCenter() || null;
    const params = new URLSearchParams({
        q, count: '10',
        lat: center ? center._lat : '',
        lon: center ? center._lng : ''
    });

    try {
        const res = await fetch(`${API_SEARCH}?${params.toString()}`, { signal: aborter.signal });
        if (!res.ok) throw new Error('검색 실패');
        const data = await res.json();
        currentItems = data.items || [];
        renderSuggest(currentItems, q);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.warn('Suggest error:', err);
            hideSuggest();
        }
    }
}

// ---- 제안 렌더링 ----
function renderSuggest(items, q) {
    if (!items.length) { hideSuggest(); return; }
    activeIndex = -1;

    suggestEl.innerHTML = items.map((it, i) => `
    <li role="option" data-idx="${i}">
      <div>
        <div class="title">${escapeHtml(it.name || '')}</div>
        <div class="addr">${escapeHtml(it.address || '')}</div>
      </div>
    </li>
  `).join('');

    // 클릭 선택
    suggestEl.querySelectorAll('li').forEach(li => {
        li.addEventListener('mousedown', () => {
            const idx = Number(li.getAttribute('data-idx'));
            chooseItem(currentItems[idx]);
        });
    });

    positionSuggest();
    suggestEl.classList.add('show');
}

// ---- 최근기록 렌더링 ----
function renderHistory() {
    const recents = loadHistory();
    if (!recents.length) { hideSuggest(); return; }

    activeIndex = -1;
    suggestEl.innerHTML = `
    <li class="section-title" aria-disabled="true">최근 검색</li>
    ${recents.map(t => `
      <li class="recent-item" data-term="${escapeHtml(t)}">
        <span class="text">${escapeHtml(t)}</span>
        <button class="del" type="button" aria-label="삭제" data-term="${escapeHtml(t)}">×</button>
      </li>
    `).join('')}
  `;

    // 항목 클릭 → 입력창에 채우고 제안 실행
    suggestEl.querySelectorAll('.recent-item').forEach(li => {
        li.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('del')) return; // 삭제 버튼은 아래 핸들러에서
            const term = li.getAttribute('data-term');
            chooseRecent(term);
        });
    });

    // X 삭제 버튼
    suggestEl.querySelectorAll('.del').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const term = btn.getAttribute('data-term');
            removeHistoryTerm(term);
            clearHistoryIfEmpty(true);
        });
    });

    positionSuggest();
    suggestEl.classList.add('show');
}

// ---- 최근 선택 동작 ----
function chooseRecent(term) {
    searchInput.value = term;
    fetchSuggest(term);
}

// ---- 제안 선택: 지도 이동 + 히스토리 저장 ----
function chooseItem(it) {
    hideSuggest();
    if (!it || !it.lat || !it.lon) return;

    const pos = new Tmapv3.LatLng(Number(it.lat), Number(it.lon));
    tmapMap.setCenter(pos);
    tmapMap.setZoom(16);

    if (poiMarker) poiMarker.setMap(null);
    poiMarker = new Tmapv3.Marker({ position: pos, map: tmapMap, title: it.name || '' });

    // 입력창의 텍스트 또는 장소명 저장
    saveHistoryTerm(searchInput.value || it.name);
}

// ---- 드롭다운 위치 ----
function positionSuggest() {
    const form = document.querySelector('.map-search-form');
    if (!form || !suggestEl) return;
    const rect = form.getBoundingClientRect();
    suggestEl.style.left  = rect.left + 'px';
    suggestEl.style.top   = (rect.bottom + window.scrollY) + 'px';
    suggestEl.style.width = rect.width + 'px';
}

// ---- 키보드 활성 이동 ----
function moveActive(delta) {
    const lis = [...suggestEl.querySelectorAll('li')].filter(li => !li.classList.contains('section-title'));
    if (!lis.length) return;
    activeIndex = (activeIndex + delta + lis.length) % lis.length;
    lis.forEach((li, i) => li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
    lis[activeIndex].scrollIntoView({ block: 'nearest' });
}

// ---- 유틸 ----
function hideSuggest(){ suggestEl?.classList.remove('show'); }
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); }; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ---- 부트스트랩 ----
(function boot(retry = 20) {
    if (window.Tmapv3 && document.getElementById('map_div')) {
        tmapMap = new Tmapv3.Map('map_div', {
            center: new Tmapv3.LatLng(37.5652045, 126.98702028),
            zoom: 16
        });
        setupSearchSuggest();
        window.addEventListener('resize', positionSuggest);
    } else if (retry > 0) {
        setTimeout(() => boot(retry - 1), 150);
    } else {
        console.warn('Tmap SDK 로드 실패');
    }
})();
