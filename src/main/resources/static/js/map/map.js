// ======================= map.js (single file) =======================
// 로드 확인용
window.__MAP_JS_LOADED__ = true;
console.log('[map.js] loaded', new Date().toISOString());

// -------- Context Path & API --------
function getCtx() {
    const m = document.querySelector('meta[name="ctx"]');
    const v = (m && m.content) || '';
    if (!v) console.warn('[map.js] <meta name="ctx"> not found. API path may be wrong.');
    return v;
}
const API_SEARCH = getCtx() + '/api/map/search';
console.log('[map.js] API_SEARCH =', API_SEARCH);

// -------- Global state --------
let tmapMap;                 // Tmapv3.Map
let myLocMarker = null;
let poiMarker = null;
let suggestEl, searchInput;
let aborter = null;
let activeIndex = -1;
let currentItems = [];
let lastQuery = '';
let _refreshing = false;

// -------- Safety: global error log --------
window.addEventListener('error', e => {
    console.error('[map.js] JS Error:', e.message, e.filename, e.lineno, e.error);
});

// -------- Optional: sidebar toggle (used by side-peek button) --------
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const peekBtn = document.querySelector('.side-peek');
    if (!sidebar || !peekBtn) return;
    const open = !sidebar.classList.contains('show');
    sidebar.classList.toggle('show', open);
    peekBtn.classList.toggle('open', open);
}
window.toggleSidebar = toggleSidebar; // for inline onclick

// ======================= Search Suggest =======================
function setupSearchSuggest() {
    searchInput = document.getElementById('mapSearchInput')
        || document.querySelector('.map-search-form input[type="search"]');
    suggestEl   = document.getElementById('searchSuggest')
        || document.querySelector('.map-search-form .search-suggest');

    if (!searchInput || !suggestEl) {
        console.warn('[map.js] search input / suggest list not found');
        return;
    }

    const debounced = debounce(async (q) => {
        if (q.length < 2) { hideSuggest(); return; }
        await fetchSuggest(q);
    }, 200);

    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        debounced(q);
    });

    searchInput.addEventListener('blur', () => setTimeout(hideSuggest, 120));

    searchInput.addEventListener('keydown', (e) => {
        if (!suggestEl.classList.contains('show')) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
        else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < currentItems.length) {
                e.preventDefault(); chooseItem(currentItems[activeIndex]);
            }
        } else if (e.key === 'Escape') { hideSuggest(); }
    });

    // Search button
    document.getElementById('mapSearchBtn')?.addEventListener('click', () => {
        if (currentItems.length) chooseItem(currentItems[0]);
    });

    console.log('[map.js] search wired');
}

async function fetchSuggest(q) {
    if (aborter) aborter.abort();
    aborter = new AbortController();

    const center = tmapMap?.getCenter() || null;
    const params = new URLSearchParams({
        q,
        count: '10',
        lat: center ? center._lat : '',
        lon: center ? center._lng : ''
    });
    const url = `${API_SEARCH}?${params.toString()}`;
    console.log('[search] →', url);

    try {
        const res = await fetch(url, { signal: aborter.signal });
        if (!res.ok) {
            const txt = await res.text().catch(()=> '');
            console.error('[search] HTTP', res.status, txt);
            throw new Error(`검색 실패 (${res.status})`);
        }
        const data = await res.json();
        currentItems = data.items || [];
        lastQuery = q;
        renderSuggest(currentItems);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.warn('Suggest error:', err);
            hideSuggest();
        }
    }
}

function renderSuggest(items) {
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

    suggestEl.querySelectorAll('li').forEach(li => {
        li.addEventListener('mousedown', () => {
            const idx = Number(li.getAttribute('data-idx'));
            chooseItem(currentItems[idx]);
        });
    });

    positionSuggest();
    suggestEl.classList.add('show');
}

function chooseItem(it) {
    hideSuggest();
    if (!it || !it.lat || !it.lon) return;

    const pos = new Tmapv3.LatLng(Number(it.lat), Number(it.lon));
    tmapMap.setCenter(pos);
    tmapMap.setZoom(16);

    if (poiMarker) poiMarker.setMap(null);
    poiMarker = new Tmapv3.Marker({ position: pos, map: tmapMap, title: it.name || '' });
}

function positionSuggest() {
    const form = document.querySelector('.map-search-form');
    if (!form || !suggestEl) return;
    const rect = form.getBoundingClientRect();
    suggestEl.style.left  = rect.left + 'px';
    suggestEl.style.top   = (rect.bottom + window.scrollY) + 'px';
    suggestEl.style.width = rect.width + 'px';
}

function moveActive(delta) {
    const lis = [...suggestEl.querySelectorAll('li')];
    if (!lis.length) return;
    activeIndex = (activeIndex + delta + lis.length) % lis.length;
    lis.forEach((li, i) => li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
    lis[activeIndex].scrollIntoView({ block:'nearest' });
}

function hideSuggest(){ suggestEl?.classList.remove('show'); }
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); }; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ======================= Controls: My Location / Refresh =======================
function locateMe() {
    const btn = document.getElementById('btnMyLocation');
    if (!navigator.geolocation) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return; }
    btn?.classList.add('loading');

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            const here = new Tmapv3.LatLng(latitude, longitude);
            tmapMap?.setCenter(here);
            tmapMap?.setZoom(17);
            if (myLocMarker) myLocMarker.setMap(null);
            myLocMarker = new Tmapv3.Marker({ map: tmapMap, position: here, title: '내 위치' });
            btn?.classList.remove('loading');
            showToast('내 위치로 이동했습니다.');
        },
        (err) => {
            btn?.classList.remove('loading');
            let msg = '위치를 가져오지 못했습니다.';
            if (err.code === err.PERMISSION_DENIED) msg = '위치 권한이 거부되었습니다.';
            if (err.code === err.POSITION_UNAVAILABLE) msg = '위치 정보를 사용할 수 없습니다.';
            if (err.code === err.TIMEOUT) msg = '위치 요청이 시간 초과되었습니다.';
            alert(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}
function setRefreshSpinning(on) {
    const btn = document.getElementById('btnRefresh');
    if (!btn) return;
    btn.classList.toggle('is-spinning', on);
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
}
// 시각적 피드백 + 재검색/리사이즈
async function refreshMap() {
    if (_refreshing) return;
    _refreshing = true;
    setRefreshSpinning(true);        // 회전 시작

    try {
        // 1) 지도 리사이즈/리드로우
        const c = tmapMap?.getCenter();
        tmapMap?.resize();
        if (c) tmapMap?.setCenter(c);

        // 2) 검색어가 2자 이상이면 재검색 호출
        const q = (document.getElementById('mapSearchInput')?.value || '').trim();
        if (q.length >= 2) {
            await fetchSuggest(q);       // 네가 만든 함수 재사용
        }
    } catch (e) {
        console.warn('refreshMap error:', e);
    } finally {
        setRefreshSpinning(false);     // 회전 종료
        _refreshing = false;
    }
}

function zoomIn() {
    try {
        const z = (typeof tmapMap.getZoom === 'function') ? tmapMap.getZoom() : 16;
        tmapMap.setZoom(Math.min(z + 1, 19)); // maxZoom은 상황에 맞게
    } catch(e) { console.warn('zoomIn error', e); }
}
function zoomOut() {
    try {
        const z = (typeof tmapMap.getZoom === 'function') ? tmapMap.getZoom() : 16;
        tmapMap.setZoom(Math.max(z - 1, 3));  // minZoom은 상황에 맞게
    } catch(e) { console.warn('zoomOut error', e); }
}

// 바인딩 (DOMContentLoaded 시점에 같이 실행)
document.getElementById('btnZoomIn') ?.addEventListener('click', zoomIn);
document.getElementById('btnZoomOut')?.addEventListener('click', zoomOut);

// 인라인 onclick 대비 (원하면)
window.zoomIn  = zoomIn;
window.zoomOut = zoomOut;
// 인라인 onclick에서도 쓸 수 있게 전역에 노출
window.locateMe = locateMe;
window.refreshMap = refreshMap;

// ======================= Toast / Style Inject =======================
function showToast(msg){
    let t = document.getElementById('mapToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'mapToast';
        t.className = 'map-toast';
        // 기본 스타일 주입(별도 CSS 없어도 보이게)
        t.style.position = 'fixed';
        t.style.right = '12px';
        t.style.bottom = '90px';
        t.style.background = 'rgba(0,0,0,.72)';
        t.style.color = '#fff';
        t.style.padding = '8px 12px';
        t.style.borderRadius = '8px';
        t.style.fontSize = '12px';
        t.style.zIndex = '2147483647';
        t.style.opacity = '0';
        t.style.transform = 'translateY(6px)';
        t.style.transition = 'opacity .18s ease, transform .18s ease';
        document.body.appendChild(t);

        // 스핀 애니메이션 & 토스트 show 스타일 한번만 주입
        if (!document.getElementById('mapInlineStyle')) {
            const style = document.createElement('style');
            style.id = 'mapInlineStyle';
            style.textContent = `
        #btnRefresh.spin i { animation: spin .7s linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .map-toast.show { opacity: 1 !important; transform: translateY(0) !important; }
      `;
            document.head.appendChild(style);
        }
    }
    t.textContent = msg;
    // show
    t.classList.add('show');
    // hide
    setTimeout(() => t.classList.remove('show'), 1200);
}

function timeNow(){
    const d = new Date();
    return d.toLocaleTimeString([], { hour12:false });
}

// ======================= Init (boot) =======================
// 버튼/검색 핸들러 바인딩 (직접 바인딩 + 위임 둘 다 가능하지만, 직접 바인딩이면 충분)
function bindDirectControls(){
    document.getElementById('btnMyLocation')?.addEventListener('click', locateMe);
    document.getElementById('btnRefresh')?.addEventListener('click', refreshMap);
}

document.addEventListener('DOMContentLoaded', () => {
    bindDirectControls();
    setupSearchSuggest();
    window.addEventListener('resize', positionSuggest);
    console.log('[map.js] DOM ready');
});

// Tmap SDK 로드 감시 후 지도 초기화
(function boot(retry = 20) {
    if (window.Tmapv3 && document.getElementById('map_div')) {
        try {
            tmapMap = new Tmapv3.Map('map_div', {
                center: new Tmapv3.LatLng(37.5652045, 126.98702028),
                zoom: 16
            });
            console.log('[map.js] Tmap ready');
        } catch (e) {
            console.error('[map.js] Tmap init failed:', e);
        }
    } else if (retry > 0) {
        setTimeout(() => boot(retry - 1), 150);
    } else {
        console.warn('[map.js] Tmap SDK 로드 실패');
    }
})();

// ======================= map.js (single file) =======================
