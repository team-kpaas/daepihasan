/* ======================= map.js (minimal & solid) ======================= */
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
const ACTIVE_TYPES = new Set();

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

// 카드 닫힘과 마커 클릭이 겹칠 때를 위한 간단한 가드
let _lastMarkerClickAt = 0;

const HYDRANT_MIN_ZOOM = 16;
const CLUSTER_UNTIL_ZOOM = 16;

/* -------- Safety: global error log -------- */
window.addEventListener('error', e => {
    console.error('[map.js] JS Error:', e.message, e.filename, e.lineno, e.error);
});

/* ======================= Sidebar toggle (optional) ======================= */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const peekBtn = document.querySelector('.side-peek');
    if (!sidebar || !peekBtn) return;
    const open = !sidebar.classList.contains('show');
    sidebar.classList.toggle('show', open);
    peekBtn.classList.toggle('open', open);
}
window.toggleSidebar = toggleSidebar;

/* ======================= Search Suggest (unchanged) ======================= */
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
        const c = tmapMap?.getCenter();
        tmapMap?.resize();
        if (c) tmapMap?.setCenter(c);
        await refreshFacilitiesNow();
        const q = (document.getElementById('mapSearchInput')?.value || '').trim();
        if (q.length >= 2) await fetchSuggest(q);
    } catch (e) {
        console.warn('refreshMap error:', e);
    } finally {
        setRefreshSpinning(false);
        _refreshing = false;
    }
}

function zoomIn()  { try { tmapMap.setZoom(Math.min((tmapMap.getZoom()||16)+1, 19)); } catch(e){} }
function zoomOut() { try { tmapMap.setZoom(Math.max((tmapMap.getZoom()||16)-1,  3)); } catch(e){} }

/* ======================= POI Card ======================= */
let poiCardEl = null;

function ensurePoiCardStyles(){
    if (document.getElementById('poiCardStyle')) return;
    const style = document.createElement('style');
    style.id = 'poiCardStyle';
    style.textContent = `
    .poi-card {
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
      max-width: 560px; width: calc(100% - 24px);
      background: #fff; color:#111; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.18);
      padding: 14px 16px; z-index: 2147483647; border: 1px solid rgba(0,0,0,.06);
    }
    .poi-card.hide { display: none; }
    .poi-card .head { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .poi-card .title { font-weight:800; font-size:16px; line-height:1.2; flex:1; }
    .poi-card .typechip { font-size:12px; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#3740ff; }
    .poi-card .line { font-size:13px; color:#444; margin:2px 0; }
    .poi-card .muted { color:#777; }
    .poi-card .row { display:flex; align-items:center; gap:8px; margin-top:8px; }
    .poi-card .btn { border:1px solid #e5e7eb; background:#fff; border-radius:10px; padding:6px 10px; cursor:pointer; font-size:13px; }
    .poi-card .btn:hover { background:#f9fafb; }
    .poi-card .close { margin-left:auto; border:none; background:transparent; font-size:18px; line-height:1; cursor:pointer; }
  `;
    document.head.appendChild(style);
}

function getDisplayAddress(it){
    return it.roadAddr || it.roadAddress || it.road_name || it.road || it.address || it.addr || it.jibunAddress || it.jibun || '';
}

function showPoiCard(it){
    ensurePoiCardStyles();
    if (!poiCardEl) {
        poiCardEl = document.createElement('div');
        poiCardEl.className = 'poi-card hide';
        document.body.appendChild(poiCardEl);
    }
    const typeKey = normalizeType(it);
    const typeName = TYPE_LABELS[typeKey] || '시설';
    const addr = getDisplayAddress(it);

    poiCardEl.innerHTML = `
    <div class="head">
      <div class="typechip">${typeName}</div>
      <div class="title">${escapeHtml(it.name || it.facName || typeName)}</div>
      <button class="close" title="닫기" aria-label="닫기">×</button>
    </div>
    ${addr ? `<div class="line"><span class="muted">도로명</span> ${escapeHtml(addr)}</div>` : ''}
    ${it.mngInstNm ? `<div class="line"><span class="muted">관리기관</span> ${escapeHtml(it.mngInstNm)}</div>` : ''}
    ${it.mngInstTel ? `<div class="line"><span class="muted">연락처</span> ${escapeHtml(it.mngInstTel)}</div>` : ''}
    ${it.installYear ? `<div class="line"><span class="muted">설치연도</span> ${escapeHtml(String(it.installYear))}</div>` : ''}
    <div class="row">
      <button class="btn" id="poiCloseBtn">닫기</button>
    </div>
  `;
    poiCardEl.querySelector('.close')?.addEventListener('click', hidePoiCard);
    poiCardEl.querySelector('#poiCloseBtn')?.addEventListener('click', hidePoiCard);
    poiCardEl.classList.remove('hide');
}

function hidePoiCard(){ poiCardEl?.classList.add('hide'); }

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

/* ======================= Facilities ======================= */
function clearFacilityMarkers() {
    facilityMarkers.forEach(m => m.setMap(null));
    facilityMarkers = [];
}

function getCurrentBBox() {
    if (!tmapMap) return null;
    const b = tmapMap.getBounds();
    const sw = b._sw, ne = b._ne;
    return { minLat: sw._lat, maxLat: ne._lat, minLon: sw._lng, maxLon: ne._lng };
}

function buildTypesQuery(typesOverride) {
    const arr = typesOverride ?? [...ACTIVE_TYPES];
    if (!arr.length || arr.length === Object.keys(TYPE_LABELS).length) return '';
    return '&types=' + encodeURIComponent(arr.join(','));
}

async function fetchFacilitiesInView() {
    const bbox = getCurrentBBox();
    if (!bbox) return [];

    const z = tmapMap?.getZoom() ?? 16;
    let typesForFetch = [...ACTIVE_TYPES];

    if (z < HYDRANT_MIN_ZOOM && typesForFetch.includes('hydrant')) {
        typesForFetch = typesForFetch.filter(t => t !== 'hydrant');
        showToast('소화전은 지도를 더 확대하면 표시됩니다 (z≥16)');
    }

    const params = new URLSearchParams(bbox).toString();
    const url = `${getCtx()}/api/facility/bbox?${params}${buildTypesQuery(typesForFetch)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let list = await res.json();

        if (typesForFetch.length && typesForFetch.length < Object.keys(TYPE_LABELS).length) {
            list = list.filter(it => typesForFetch.includes(normalizeType(it)));
        }
        return list;
    } catch (e) {
        console.warn('fetchFacilitiesInView error:', e);
        return [];
    }
}

function clusterHydrants(items) {
    const z = tmapMap?.getZoom() ?? 16;
    if (z > CLUSTER_UNTIL_ZOOM) return items;
    if (!items?.length) return items;

    const cellPx = z <= 14 ? 80 : 60;
    const degPerPxLon = 360 / (256 * Math.pow(2, z));
    const step = cellPx * degPerPxLon;

    const buckets = new Map();
    for (const it of items) {
        const lat = +it.lat, lon = +it.lon;
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
        const gx = Math.floor(lon / step);
        const gy = Math.floor(lat / step);
        const key = gx + ',' + gy;
        let b = buckets.get(key);
        if (!b) { b = { sumLat:0, sumLon:0, count:0, sample: it }; buckets.set(key, b); }
        b.sumLat += lat; b.sumLon += lon; b.count++;
    }

    const out = [];
    for (const b of buckets.values()) {
        if (b.count === 1) out.push(b.sample);
        else out.push({
            lat: b.sumLat / b.count,
            lon: b.sumLon / b.count,
            isCluster: true,
            count: b.count,
            name: `${b.count}개 소화전`,
            facilityTypeCd: 'hydrant'
        });
    }
    return out;
}

function makeClusterIcon(count) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34">
  <circle cx="17" cy="17" r="16" fill="#ff3b30" fill-opacity=".9"/>
  <circle cx="17" cy="17" r="12" fill="#fff"/>
  <text x="17" y="21" text-anchor="middle" font-size="12" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#ff3b30">${count}</text>
</svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
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
    return { icon: url, iconSize: new Tmapv3.Size(28, 28) };
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

/* ====== ★ 핵심: 마커 클릭 시 카드 띄우고, 다른 마커 클릭 시 내용만 교체 ====== */
function renderFacilities(items) {
    clearFacilityMarkers();

    items.forEach((it, idx) => {
        const pos = new Tmapv3.LatLng(+it.lat, +it.lon);
        const typeKey = normalizeType(it);

        const iconOpt = it.isCluster
            ? { icon: makeClusterIcon(it.count), iconSize: new Tmapv3.Size(34, 34) }
            : markerIconOption(typeKey);

        const marker = new Tmapv3.Marker({
            map: tmapMap,
            position: pos,
            title: it.name || TYPE_LABELS[typeKey] || '소방용수시설',
            clickable: true,
            zIndex: it.isCluster ? 1002 : 1001,
            ...iconOpt,
        });

        // ---- 디버그용 라벨 (콘솔 확인 편하게) ----
        const label = `[marker#${idx}${it.isCluster ? ' cluster' : ''}] ${it.name || it.facName || typeKey}`;

        // ---- 한 번에 여러 이벤트에서 중복 호출되는 것 방지 가드 ----
        const guard = { t: 0 };
        const onTap = (evType) => (ev) => {
            const now = Date.now();
            if (now - guard.t < 120) return; // 연속 트리거 방지
            guard.t = now;

            console.log(`${label} :: ${evType} fired`, { it, pos, ev });

            if (it.isCluster) {
                console.log(`${label} :: zoom-in (cluster)`);
                try {
                    tmapMap.setCenter(pos);
                    tmapMap.setZoom(Math.min((tmapMap.getZoom() || 16) + 1, 19));
                } catch (e) { console.warn('cluster zoom error', e); }
                return;
            }

            _lastMarkerClickAt = now;
            showPoiCard(it);
        };

        // ---- 가능한 모든 타입에 바인딩 (환경별 차이 대응) ----
        const evTypes = ['click', 'mouseup', 'pointerup', 'touchend'];

        // 1) 벡터JS에서 제공하는 전통 방식
        if (Tmapv3?.Event?.addListener) {
            evTypes.forEach((t) => {
                try { Tmapv3.Event.addListener(marker, t, onTap(`Tmapv3.Event:${t}`)); } catch(_) {}
            });
        }

        // 2) 일부 환경(또는 버전)에서 제공되는 인스턴스 메서드
        if (typeof marker.addListener === 'function') {
            evTypes.forEach((t) => {
                try { marker.addListener(t, onTap(`marker.addListener:${t}`)); } catch(_) {}
            });
        }

        facilityMarkers.push(marker);
    });

    updateFacilityStatus(items);
}


/* ======================= Auto refresh ======================= */
const refreshFacilitiesDebounced = debounce(refreshFacilitiesNow, 250);

function bindFacilityAutoRefresh() {
    if (!tmapMap) return;
    Tmapv3.Event.addListener(tmapMap, 'dragend', refreshFacilitiesDebounced);
    Tmapv3.Event.addListener(tmapMap, 'zoomend', refreshFacilitiesDebounced);
    refreshFacilitiesDebounced();
}

async function refreshFacilitiesNow() {
    let list = await fetchFacilitiesInView();
    const onlyHydrant = (ACTIVE_TYPES.size === 1 && ACTIVE_TYPES.has('hydrant'));
    if (onlyHydrant && list.length > 800) list = clusterHydrants(list);
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

/* ======================= Click-through guard ======================= */
function ensureClickThroughStyles(){
    if (document.getElementById('mapPointerGuard')) return;
    const style = document.createElement('style');
    style.id = 'mapPointerGuard';
    style.textContent = `
    /* 오버레이 래퍼는 기본적으로 클릭 통과 */
    header, .side-peek, .bottom-bar, .fab-cluster, .zoom-controls { pointer-events: none; }

    /* 래퍼 안에서 실제 인터랙션이 필요한 요소만 다시 활성화 */
    header .map-search-form, header .map-search-form * { pointer-events: auto; }
    .side-peek, .side-peek * { pointer-events: auto; }
    .bottom-bar .chips, .bottom-bar .chips *, #facStatus { pointer-events: auto; }
    .fab-cluster, .fab-cluster * { pointer-events: auto; }
    .zoom-controls, .zoom-controls * { pointer-events: auto; }
    .search-suggest { pointer-events: auto; }
    .poi-card, .poi-card * { pointer-events: auto; }

    /* 지도는 항상 클릭 가능 */
    #map_div, #map_div * { pointer-events: auto !important; }
  `;
    document.head.appendChild(style);

    const map = document.getElementById('map_div');
    if (map) { map.style.position = 'relative'; map.style.zIndex = '10'; }
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
    ensureClickThroughStyles();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePoiCard(); });
    bindDirectControls();
    initTypeChips();
    setupSearchSuggest();
    window.addEventListener('resize', positionSuggest);
    console.log('[map.js] DOM ready');
});

/* ======================= Tmap boot ======================= */
(function boot(retry = 40) {
    if (window.Tmapv3 && document.getElementById('map_div')) {
        try {
            tmapMap = new Tmapv3.Map('map_div', {
                center: new Tmapv3.LatLng(37.5652045, 126.98702028),
                zoom: 16
            });
            console.log('[map.js] Tmap ready');

            // 맵 빈 곳 클릭 시 카드 닫기 (마커 클릭 직후엔 닫지 않기)
            Tmapv3.Event.addListener(tmapMap, 'click', () => {
                const now = Date.now();
                if (now - _lastMarkerClickAt < 250) return; // 방금 마커 클릭이면 무시
                hidePoiCard();
            });

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
