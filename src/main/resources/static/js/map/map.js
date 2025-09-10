/* ======================= map.js (clean single file) ======================= */
/* Boot log */
window.__MAP_JS_LOADED__ = true;
console.log('[map.js] loaded', new Date().toISOString());

/* -------- Context Path & API -------- */
function getCtx() {
    const m = document.querySelector('meta[name="ctx"]');
    const v = (m && m.content) || '';
    if (!v) console.warn('[map.js] <meta name="ctx"> not found. API path may be wrong.');
    return v;
}
const API_SEARCH = getCtx() + '/api/map/search';
console.log('[map.js] API_SEARCH =', API_SEARCH);

/* -------- Facility Type & Icons -------- */
const TYPE_LABELS = {
    hydrant:   '소화전',
    tower:     '급수탑',
    ebox:      '비상소화장치',
    reservoir: '저수조',
};
const ICON_URLS = {
    hydrant:   getCtx() + '/images/map/hydrant.png',
    tower:     getCtx() + '/images/map/fac-tower.svg',
    ebox:      getCtx() + '/images/map/fac-ebox.svg',
    reservoir: getCtx() + '/images/map/fac-reservoir.svg',
};
const ACTIVE_TYPES = new Set(); // 현재 ON인 타입들

/* -------- Global State -------- */
let tmapMap;                 // Tmapv3.Map
let myLocMarker = null;
let poiMarker = null;
let suggestEl, searchInput;
let aborter = null;
let activeIndex = -1;
let currentItems = [];
let _refreshing = false;
let facilityMarkers = [];

/* -------- Safety: global error log -------- */
window.addEventListener('error', e => {
    console.error('[map.js] JS Error:', e.message, e.filename, e.lineno, e.error);
});

/* ======================= Sidebar toggle ======================= */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const peekBtn = document.querySelector('.side-peek');
    if (!sidebar || !peekBtn) return;
    const open = !sidebar.classList.contains('show');
    sidebar.classList.toggle('show', open);
    peekBtn.classList.toggle('open', open);
}
window.toggleSidebar = toggleSidebar;

/* ======================= Search Suggest ======================= */
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

/* ======================= Controls: My Location / Refresh / Zoom ======================= */
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
    const btn = document.getElementById('fabRefresh');
    if (!btn) return;
    btn.classList.toggle('is-spinning', on);
    btn.setAttribute('aria-busy', on ? 'true' : 'false');

    // 1회만 스타일 주입
    if (!document.getElementById('mapInlineStyle')) {
        const style = document.createElement('style');
        style.id = 'mapInlineStyle';
        style.textContent = `
      .fab.is-spinning i { animation: mapspin .7s linear infinite; }
      @keyframes mapspin { to { transform: rotate(360deg); } }
      .map-toast { position: fixed; right: 12px; bottom: 90px; background: rgba(0,0,0,.72);
                   color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 12px;
                   z-index: 2147483647; opacity: 0; transform: translateY(6px);
                   transition: opacity .18s ease, transform .18s ease; }
      .map-toast.show { opacity: 1 !important; transform: translateY(0) !important; }
    `;
        document.head.appendChild(style);
    }
}

async function refreshMap() {
    if (_refreshing) return;
    _refreshing = true;
    setRefreshSpinning(true);

    try {
        // 1) 지도 리사이즈/센터 유지
        const c = tmapMap?.getCenter();
        tmapMap?.resize();
        if (c) tmapMap?.setCenter(c);

        // 2) 시설 즉시 새로고침 (중요!)
        await refreshFacilitiesNow();

        // 3) 검색어가 2자 이상이면 제안 재조회 (선택)
        const q = (document.getElementById('mapSearchInput')?.value || '').trim();
        if (q.length >= 2) {
            await fetchSuggest(q);
        }
    } catch (e) {
        console.warn('refreshMap error:', e);
    } finally {
        setRefreshSpinning(false);
        _refreshing = false;
    }
}

function zoomIn() {
    try {
        const z = (typeof tmapMap.getZoom === 'function') ? tmapMap.getZoom() : 16;
        tmapMap.setZoom(Math.min(z + 1, 19));
    } catch(e) { console.warn('zoomIn error', e); }
}
function zoomOut() {
    try {
        const z = (typeof tmapMap.getZoom === 'function') ? tmapMap.getZoom() : 16;
        tmapMap.setZoom(Math.max(z - 1, 3));
    } catch(e) { console.warn('zoomOut error', e); }
}

/* ======================= Toast ======================= */
function showToast(msg){
    let t = document.getElementById('mapToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'mapToast';
        t.className = 'map-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1200);
}

/* ======================= Facilities (hydrant/ebox/...) ======================= */
function clearFacilityMarkers() {
    facilityMarkers.forEach(m => m.setMap(null));
    facilityMarkers = [];
}

function getCurrentBBox() {
    if (!tmapMap) return null;
    const bounds = tmapMap.getBounds();      // Tmapv3.LatLngBounds
    const sw = bounds._sw;                    // { _lat, _lng }
    const ne = bounds._ne;
    return { minLat: sw._lat, maxLat: ne._lat, minLon: sw._lng, maxLon: ne._lng };
}

function buildTypesQuery() {
    if (ACTIVE_TYPES.size === 0 || ACTIVE_TYPES.size === Object.keys(TYPE_LABELS).length) return '';
    return '&types=' + encodeURIComponent([...ACTIVE_TYPES].join(','));
}

async function fetchFacilitiesInView() {
    const bbox = getCurrentBBox();
    if (!bbox) return [];

    const params = new URLSearchParams(bbox).toString();
    const url = `${getCtx()}/api/facility/bbox?${params}${buildTypesQuery()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json(); // [{id,name,facilityTypeCd,lat,lon,...}]
        if (ACTIVE_TYPES.size && ACTIVE_TYPES.size < Object.keys(TYPE_LABELS).length) {
            return list.filter(it => ACTIVE_TYPES.has(normalizeType(it)));
        }
        return list;
    } catch (e) {
        console.warn('fetchFacilitiesInView error:', e);
        return [];
    }
}

function normalizeType(it) {
    const raw = (it.facilityTypeCd || it.type || '').toString().toLowerCase().trim();
    if (/hydrant|소화전|^h(y)?$|^10$/.test(raw)) return 'hydrant';
    if (/tower|급수탑|^t(ower)?$|^20$/.test(raw)) return 'tower';
    if (/ebox|비상소화|^e(box)?$|^30$/.test(raw)) return 'ebox';
    if (/reservoir|저수조|^r(eservoir)?$|^40$/.test(raw)) return 'reservoir';
    return 'hydrant';
}

function markerIconOption(typeKey) {
    const url = ICON_URLS[typeKey] || ICON_URLS['hydrant'];
    return {
        icon: url,
        iconSize: new Tmapv3.Size(28, 28),
    };
}

function updateFacilityStatus(items) {
    const el = document.getElementById('facStatus');
    if (!el) return;

    if (!items.length) { el.textContent = '화면 내 0개'; return; }

    const counts = {};
    items.forEach(it => {
        const k = normalizeType(it);
        counts[k] = (counts[k] || 0) + 1;
    });

    const order = [...ACTIVE_TYPES];
    const parts = order.map(k => `${TYPE_LABELS[k]} ${counts[k] || 0}개`);
    el.textContent = parts.length ? parts.join(', ') : `화면 내 ${items.length}개`;
}

function renderFacilities(items) {
    clearFacilityMarkers();

    items.forEach(it => {
        const pos = new Tmapv3.LatLng(it.lat, it.lon);
        const typeKey = normalizeType(it);

        const marker = new Tmapv3.Marker({
            map: tmapMap,
            position: pos,
            title: it.name || TYPE_LABELS[typeKey] || '소방용수시설',
            ...markerIconOption(typeKey),
        });

        const html = `
      <div style="min-width:180px">
        <div style="font-weight:700">${escapeHtml(it.name || TYPE_LABELS[typeKey] || '소방용수시설')}</div>
        <div style="font-size:12px;color:#555">유형: ${TYPE_LABELS[typeKey] || '-'}</div>
        ${it.mngInstNm ? `<div style="font-size:12px">${escapeHtml(it.mngInstNm)}</div>` : ''}
        ${it.mngInstTel ? `<div style="font-size:12px">${escapeHtml(it.mngInstTel)}</div>` : ''}
        ${it.installYear ? `<div style="font-size:12px">설치연도: ${escapeHtml(String(it.installYear))}</div>` : ''}
      </div>
    `;
        const info = new Tmapv3.InfoWindow({ position: pos, content: html, visible: false });
        marker.addListener('click', () => info.setVisible(!info.getVisible()));

        facilityMarkers.push(marker);
    });

    updateFacilityStatus(items);
}

const refreshFacilitiesDebounced = debounce(refreshFacilitiesNow, 250);


function bindFacilityAutoRefresh() {
    if (!tmapMap) return;
    tmapMap.addListener('dragend', refreshFacilitiesDebounced);
    tmapMap.addListener('zoomend', refreshFacilitiesDebounced);
    refreshFacilitiesDebounced(); // 최초 1회
}

async function refreshFacilitiesNow() {
    const list = await fetchFacilitiesInView();
    renderFacilities(list);
}

/* ======================= Chips (type toggles) ======================= */
function initTypeChips() {
    const chips = document.querySelectorAll('.chips .chip');
    if (!chips.length) return;

    chips.forEach(chip => {
        const type = chip.getAttribute('data-type');
        const isOn = chip.classList.contains('is-on');
        chip.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        if (isOn) ACTIVE_TYPES.add(type);

        chip.addEventListener('click', () => {
            const on = chip.classList.toggle('is-on');
            chip.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on) ACTIVE_TYPES.add(type); else ACTIVE_TYPES.delete(type);
            refreshFacilitiesDebounced();
        });
    });

    if (ACTIVE_TYPES.size === 0) {
        const hydrantBtn = document.querySelector('.chips .chip[data-type="hydrant"]');
        hydrantBtn?.classList.add('is-on');
        hydrantBtn?.setAttribute('aria-pressed', 'true');
        ACTIVE_TYPES.add('hydrant');
    }
}

/* ======================= Utils ======================= */
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); }; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

/* ======================= Init (boot) ======================= */
function bindDirectControls(){
    document.getElementById('btnMyLocation')?.addEventListener('click', locateMe);
    document.getElementById('fabRefresh')?.addEventListener('click', refreshMap);
    document.getElementById('btnZoomIn') ?.addEventListener('click', zoomIn);
    document.getElementById('btnZoomOut')?.addEventListener('click', zoomOut);
}

document.addEventListener('DOMContentLoaded', () => {
    bindDirectControls();
    initTypeChips();
    setupSearchSuggest();
    window.addEventListener('resize', positionSuggest);
    console.log('[map.js] DOM ready');
});

/* Tmap SDK 로드 감시 후 지도 초기화 */
(function boot(retry = 40) {
    if (window.Tmapv3 && document.getElementById('map_div')) {
        try {
            tmapMap = new Tmapv3.Map('map_div', {
                center: new Tmapv3.LatLng(37.5652045, 126.98702028),
                zoom: 16
            });
            console.log('[map.js] Tmap ready');
            bindFacilityAutoRefresh();
        } catch (e) {
            console.error('[map.js] Tmap init failed:', e);
        }
    } else if (retry > 0) {
        setTimeout(() => boot(retry - 1), 150);
    } else {
        console.warn('[map.js] Tmap SDK 로드 실패');
    }
})();
