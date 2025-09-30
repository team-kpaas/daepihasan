// /js/map/app.js
import { initMapAsync, getMap } from './mapCore.js';
import {
    refreshFacilitiesNow,
    getFacilityMarkers,
    normalizeType,
    ACTIVE_TYPES,
    needFetchNow,
} from './facilities.js';
import { setupSearchSuggest } from './search.js';
import { showPoiCard } from './poiCard.js';
import { debounce, showToast } from './utils.js';
import { bindControls } from './controls.js';
import { bindSidebar } from './sidebar.js';
import { joinCtx } from './ctx.js';

// ─────────────────────────────────────────────────────────
// 전역 상태
// ─────────────────────────────────────────────────────────
let __shelterCandidates = [];
let __shelterMarkers = [];
let __selectedShelterIdx = -1;
let __routeLine = null;
const SHELTER_ICON_URL = joinCtx('/images/map/shelter.png');
const TEMP_SHELTERS = [
    {
        id: 'TEMP-UJANG-1',
        name: '우장산공원(동쪽광장)',
        lat: 37.5519, lon: 126.8428,
        addr: '서울 강서구 내발산동 749 일대'
    },
    {
        id: 'TEMP-UJANG-2',
        name: '내발산근린공원(운동장)',
        lat: 37.5506, lon: 126.8460,
        addr: '서울 강서구 내발산동 일대'
    },
    {
        id: 'TEMP-UJANG-3',
        name: '발산초등학교 운동장(야외)',
        lat: 37.5492, lon: 126.8420,
        addr: '서울 강서구 내발산동 일대'
    },
    {
        id: 'TEMP-UJANG-4',
        name: '우장산역 4번출구 광장',
        lat: 37.548543, lon: 126.836303,
        addr: '서울 강서구 화곡동 우장산역'
    }
];

// 현 위치(또는 지도 중심) 기준 가까운 임시 대피소 N개 반환
function getFallbackAround(lat, lng, maxDistM = 5000, maxN = 4) {
    const list = TEMP_SHELTERS.map(s => {
        const d = Math.round(haversine({ lat: s.lat, lon: s.lon }, { lat, lng }));
        return { ...s, distM: d };
    }).filter(s => s.distM <= maxDistM)
        .sort((a, b) => a.distM - b.distM);
    return list.slice(0, maxN);
}
// 대피소 탐색 키워드 세트(우선순위 순)
const SHELTER_KEYWORDS = [
    '지진옥외대피소','지진옥외대피장소','지진대피소',
    '민방위대피소','민방위대피시설','민방위 대피소',
    '대피소','대피장소'
];

// 이름/업종 후처리 필터 (식당/카페 등 제거)
function isShelterPoi(p){
    const name = (p.name || '').toLowerCase();
    const biz  = [
        p.upperBizName, p.middleBizName, p.lowerBizName, p.className
    ].filter(Boolean).join(' ').toLowerCase();

    const kw = ['대피소','민방위','지진','옥외대피','대피장소','대피 시설'];
    const hitName = kw.some(k => name.includes(k));
    const hitBiz  = kw.some(k => biz.includes(k));
    return hitName || hitBiz;
}

document.addEventListener('DOMContentLoaded', () => {
    boot().catch(err => console.error('[app] map init failed:', err));
});

async function boot() {
    const map = await initMapAsync({ containerId: 'map_div', zoom: 16 });
    if (!map) throw new Error('Map instance not created');

    setupSearchSuggest(map);
    bindControls();
    bindSidebar();
    bindChips(map);
    bindRouteButton(map);

    const onMove = debounce(async () => {
        if (needFetchNow(map)) await refreshFacilitiesNow(map);
    }, 200);
    map.addListener('dragend', onMove);
    map.addListener('zoomend', onMove);

    try {
        map.addListener('click', (e) => {
            if (isSheetOpen()) return;
            const ll = e?.latLng || e?.LatLng || e;
            if (ll && (ll._lat ?? ll.lat) != null) {
                pickNearest(map, (ll._lat ?? ll.lat), (ll._lng ?? ll.lng), '[pick/tmap]');
            }
        });
    } catch (_) {}

    const container = document.getElementById('map_div');
    container.addEventListener('click', (ev) => {
        if (isSheetOpen()) return;
        const ll = screenToLatLng(map, container, ev);
        if (!ll) return;
        pickNearest(map, ll.lat, ll.lng, '[pick/dom]');
    }, { passive: true });

    positionChipsBar();
    wireChipsBarReposition();

    await refreshFacilitiesNow(map, true);
}

/* ───── 유틸 ───── */
function isSheetOpen(){ return document.body.classList.contains('sheet-open'); }

function screenToLatLng(map, container, ev) {
    try {
        const rect = container.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const b = map.getBounds(); const sw = b._sw, ne = b._ne;
        const width = rect.width, height = rect.height;
        if (width <= 0 || height <= 0) return null;
        const lon = sw._lng + (x / width) * (ne._lng - sw._lng);
        const lat = ne._lat - (y / height) * (ne._lat - sw._lat);
        return { lat, lng: lon };
    } catch (e) { console.warn('[screenToLatLng] failed', e); return null; }
}

function pickNearest(map, clat, clon, tag = '[pick]') {
    const z = map.getZoom() || 16;
    const degPerPxLon = 360 / (256 * Math.pow(2, z));
    const tol = degPerPxLon * 16;

    const list = getFacilityMarkers();
    let hit = null, bestD = Infinity;
    for (const m of list) {
        const d = Math.hypot(m.pos._lng - clon, m.pos._lat - clat);
        if (d < bestD) { bestD = d; hit = m; }
    }

    if (hit && bestD <= tol) {
        if (hit.isCluster) {
            try { map.setCenter(hit.pos); map.setZoom(Math.min(z + 1, 19)); } catch (_) { }
        } else {
            showPoiCard(hit.data, normalizeType(hit.data));
        }
    } else {
        console.log(tag, 'no marker', { bestD, tol, z, total: list.length });
    }
}

/* ───── 칩 바 위치 고정 ───── */
function positionChipsBar() {
    const form = document.querySelector('.map-search-form');
    const bar  = document.querySelector('.bottom-bar');
    if (!form || !bar) return;
    const r = form.getBoundingClientRect();
    const scrollY = window.scrollY || 0;
    const scrollX = window.scrollX || 0;
    bar.style.position = 'fixed';
    bar.style.left  = (r.left + scrollX) + 'px';
    bar.style.top   = (r.bottom + scrollY + 8) + 'px';
    bar.style.width = r.width + 'px';
}
function wireChipsBarReposition() {
    window.addEventListener('resize', positionChipsBar);
    window.addEventListener('scroll', positionChipsBar, { passive: true });
    window.addEventListener('orientationchange', positionChipsBar);
    const form = document.querySelector('.map-search-form');
    if (form && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => positionChipsBar());
        ro.observe(form);
    }
    document.getElementById('mapSearchInput')?.addEventListener('input', () => {
        requestAnimationFrame(positionChipsBar);
    });
}

/* ───── 칩(소화전) ───── */
function bindChips(map) {
    const chips = Array.from(document.querySelectorAll('.chip'));
    if (!chips.length) return;
    chips.forEach(c => {
        const on = ACTIVE_TYPES.has(c.dataset.type);
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
    });
    chips.forEach(ch => ch.__handler && ch.removeEventListener('click', ch.__handler));
    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clicked = e.currentTarget;
        const type = clicked.dataset.type;
        const willTurnOn = !clicked.classList.contains('is-on');
        chips.forEach(c => { c.classList.remove('is-on'); c.setAttribute('aria-pressed','false'); });
        ACTIVE_TYPES.clear();
        if (willTurnOn && type) {
            clicked.classList.add('is-on');
            clicked.setAttribute('aria-pressed','true');
            ACTIVE_TYPES.add(type);
        }
        refreshFacilitiesNow(map, true);
    };
    chips.forEach(ch => {
        ch.__handler = handler;
        ch.addEventListener('click', handler, { passive: false });
    });
}

/* ───── 길찾기(대피소) ───── */
function getTmapAppKey() {
    const k1 = document.querySelector('meta[name="tmap-key"]')?.content?.trim();
    if (k1) return k1;
    const k2 = document.querySelector('meta[name="tmap-appkey"]')?.content?.trim();
    if (k2) return k2;
    if (window.TMAP_APPKEY) return window.TMAP_APPKEY;
    console.warn('[tmap] appKey not found. Add <meta name="tmap-key" content="...">');
    return '';
}
function getUserCenter(map) {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            const opt = { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 };
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                _   => { const c = map.getCenter(); resolve({ lat: c._lat, lng: c._lng }); },
                opt
            );
        } else {
            const c = map.getCenter(); resolve({ lat: c._lat, lng: c._lng });
        }
    });
}
function haversine(a, b) {
    const toRad = d => d * Math.PI / 180, R = 6371000;
    const dLat = toRad(a.lat - b.lat);
    const dLon = toRad(a.lon - b.lng);
    const la1 = toRad(b.lat), la2 = toRad(a.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

// Tmap 주변검색: 여러 파라미터 조합 → 결과를 shelter 필터로 거른다
// Tmap 주변검색: 엔드포인트/파라미터 조합을 순차 시도하고, 결과는 대피소만 필터
// 🔁 교체: /tmap/pois/search/around (radius=미터, count<=20, appKey는 헤더에만)
// 🔁 교체: /tmap/pois/search/around 사용 (radius=km, page 필수, appKey는 헤더만)
async function tmapSearchAround(lat, lng, { keyword = '지진옥외대피소' } = {}) {
    const appKey = getTmapAppKey();
    if (!appKey) throw new Error('NO_APPKEY');

    // 권장: 1km → 2km → 3km (km 단위, 소수 가능)
    const radiiKm = ['1', '2', '3'];

    for (const radius of radiiKm) {
        const url = new URL('https://apis.openapi.sk.com/tmap/pois/search/around');
        url.search = new URLSearchParams({
            version: '1',
            format: 'json',             // 응답 포맷 명시
            centerLon: String(lng),
            centerLat: String(lat),
            radius,                     // ✅ km 단위 문자열
            page: '1',                  // ✅ 페이지 명시 (누락시 1100 나는 경우 방지)
            count: '20',                // 권장 상한
            searchKeyword: keyword,
            reqCoordType: 'WGS84GEO',
            resCoordType: 'WGS84GEO'
            // ❌ multiPoint 제거
            // ❌ appKey 쿼리파라미터 금지(헤더만)
        }).toString();

        let text = '';
        try {
            const resp = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'appKey': appKey        // ✅ 헤더에만
                }
            });
            text = await resp.text();

            if (!resp.ok) {
                console.warn('[Tmap around] HTTP', resp.status, text || '(no body)');
                continue; // 다음 반경 시도
            }
        } catch (e) {
            console.warn('[Tmap around] network fail', e);
            continue;
        }

        let data;
        try { data = text ? JSON.parse(text) : {}; } catch (e) {
            console.warn('[Tmap around] JSON parse fail', e, text?.slice(0, 200));
            continue;
        }

        const pois = data?.searchPoiInfo?.pois?.poi;
        if (!Array.isArray(pois) || !pois.length) continue;

        const list = pois
            .map(p => ({
                id: p.id,
                name: p.name,
                lat: +(p.frontLat ?? p.noorLat ?? p.lat ?? p.poiLat),
                lon: +(p.frontLon ?? p.noorLon ?? p.lon ?? p.poiLon),
                tel: p.telNo,
                upperBizName: p.upperBizName,
                middleBizName: p.middleBizName,
                lowerBizName: p.lowerBizName,
                className: p.className,
                addr: [p.upperAddrName, p.middleAddrName, p.lowerAddrName, p.detailAddrName]
                    .filter(Boolean).join(' ')
            }))
            .filter(it => Number.isFinite(it.lat) && Number.isFinite(it.lon))
            .filter(isShelterPoi); // “대피/민방위/옥외대피” 포함만 통과

        if (list.length) return list;
    }

    return [];
}


// 후보 1~4 정렬/슬라이스 (키워드 폴백 포함)
async function findShelterCandidates(lat, lng, maxN = 4) {
    try {
        for (const kw of SHELTER_KEYWORDS) {
            const raw = await tmapSearchAround(lat, lng, { keyword: kw });
            if (raw.length) {
                raw.forEach(r => r.distM = Math.round(haversine({ lat: r.lat, lon: r.lon }, { lat, lng })));
                raw.sort((a, b) => a.distM - b.distM);
                return raw.slice(0, maxN);
            }
        }
    } catch (e) {
        console.warn('[shelter/find] search error, will fallback:', e);
    }
    // 👉 폴백(임시 대피소)
    return getFallbackAround(lat, lng, 5000, maxN);
}
// 보행자 경로
async function drawRoutePedestrian(map, start, goal) {
    const appKey = getTmapAppKey();
    const url = 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1';
    const body = {
        startX: String(start.lng), startY: String(start.lat),
        endX:   String(goal.lon),  endY:   String(goal.lat),
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        startName: '출발지',
        endName: goal.name || '대피소'
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'appKey': appKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const raw = await res.text().catch(() => '');
    if (!res.ok) {
        console.warn('[Tmap route] HTTP', res.status, raw);
        throw new Error('ROUTE_FAIL');
    }

    const js = raw ? JSON.parse(raw) : {};
    const feats = js?.features || [];
    const line = feats.find(f => f.geometry?.type === 'LineString');
    if (!line) throw new Error('NO_GEOMETRY');

    const coords = line.geometry.coordinates;
    const path = coords.map(([x,y]) => new Tmapv3.LatLng(+y, +x));

    try { __routeLine?.setMap(null); } catch(_){}
    __routeLine = new Tmapv3.Polyline({
        map,
        path,
        strokeColor: '#1D4ED8',
        strokeWeight: 5,
        strokeOpacity: 0.9
    });

    try {
        const sw = new Tmapv3.LatLng(Math.min(...path.map(p=>p._lat)), Math.min(...path.map(p=>p._lng)));
        const ne = new Tmapv3.LatLng(Math.max(...path.map(p=>p._lat)), Math.max(...path.map(p=>p._lng)));
        map.fitBounds(new Tmapv3.LatLngBounds(sw, ne));
    } catch(_){}
}

// 마커
function clearShelterMarkers() {
    __shelterMarkers.forEach(m => { try { m.marker.setMap(null); } catch(_){} });
    __shelterMarkers = [];
    __selectedShelterIdx = -1;
}
function renderShelterMarkers(map, list) {
    clearShelterMarkers();
    list.forEach((s, idx) => {
        const pos = new Tmapv3.LatLng(+s.lat, +s.lon);
        const marker = new Tmapv3.Marker({
            map,
            position: pos,
            title: s.name || '대피소',
            icon: SHELTER_ICON_URL,
            iconSize: new Tmapv3.Size(32, 32),
            zIndex: 1100 + idx
        });
        marker.addListener?.('click', () => selectShelter(map, idx));
        __shelterMarkers.push({ marker, pos, data: s });
    });
}
function selectShelter(map, idx) {
    __shelterMarkers.forEach((m,i) => {
        try {
            m.marker.setZIndex(i === idx ? 2000 : (1100 + i));
            m.marker.setIconSize?.(new Tmapv3.Size(i === idx ? 40 : 32, i === idx ? 40 : 32));
        } catch(_){}
    });
    __selectedShelterIdx = idx;
    const s = __shelterCandidates[idx];
    if (s) {
        map.setCenter(new Tmapv3.LatLng(+s.lat, +s.lon));
        showToast(`${s.name} 선택됨`);
    }
}

// 바텀시트
function openShelterSheet(list, onView, onRoute){
    const sheet = document.getElementById('sheet');
    const box   = document.getElementById('sheetContent');
    if (!sheet || !box) return;

    if (sheet.parentElement !== document.body) document.body.appendChild(sheet);
    else document.body.appendChild(sheet);

    box.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <strong>주변 대피소 (${list.length}곳)</strong>
      <button type="button" class="btn btn-sm btn-outline-secondary" id="btnCloseSheet">닫기</button>
    </div>
    <div class="list-group">
      ${list.map((s, i) => `
        <div class="list-group-item" data-view="${i}" role="button" tabindex="0">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-bold">${i+1}. ${s.name ?? '대피소'}</div>
              <div class="small text-muted">${s.addr ?? ''}</div>
              <div class="small text-primary">${(s.distM ?? '?').toLocaleString()} m</div>
            </div>
            <div class="ms-2 d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-primary" data-view="${i}">보기</button>
              <button type="button" class="btn btn-sm btn-primary" data-route="${i}">길찾기</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    sheet.classList.add('show');
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('sheet-open');

    sheet.onclick = (e) => e.stopPropagation();
    sheet.onpointerdown = (e) => e.stopPropagation();

    const close = () => {
        sheet.classList.remove('show');
        sheet.setAttribute('aria-hidden','true');
        document.body.classList.remove('sheet-open');
    };
    box.querySelector('#btnCloseSheet')?.addEventListener('click', close);

    box.onclick = (ev) => {
        const r = ev.target.closest('[data-route]');
        if (r) { onRoute?.(+r.dataset.route); return; }
        const v = ev.target.closest('[data-view]');
        if (v) { onView?.(+v.dataset.view);  return; }
    };
}

// 길찾기 버튼
function bindRouteButton(map) {
    const btn = document.getElementById('btnRoute');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        try {
            const { lat, lng } = await getUserCenter(map);

            const cand = await findShelterCandidates(lat, lng, 4);
            if (!cand.length) { showToast('주변에서 대피소를 찾지 못했어요'); return; }

            __shelterCandidates = cand;
            renderShelterMarkers(map, cand);

            openShelterSheet(
                cand,
                (idx) => selectShelter(map, idx),
                async (idx) => {
                    const goal = __shelterCandidates[idx];
                    if (!goal) return;
                    try {
                        await drawRoutePedestrian(map, { lat, lng }, goal);
                        selectShelter(map, idx);
                        showToast('경로를 그렸습니다');
                    } catch (e) {
                        console.warn('[route/draw] fail', e);
                        showToast('경로 탐색에 실패했어요');
                    }
                }
            );

            try {
                const lats = cand.map(s => +s.lat), lons = cand.map(s => +s.lon);
                const sw = new Tmapv3.LatLng(Math.min(...lats), Math.min(...lons));
                const ne = new Tmapv3.LatLng(Math.max(...lats), Math.max(...lons));
                map.fitBounds(new Tmapv3.LatLngBounds(sw, ne));
            } catch(_){}

        } catch (e) {
            console.warn('[route] error', e);
            showToast('대피소 탐색 중 오류가 발생했어요');
        }
    });
}

function drawFakeRoute(map, start, goal) {
    try { __routeLine?.setMap(null); } catch (_) {}
    const path = [
        new Tmapv3.LatLng(start.lat, start.lng),
        new Tmapv3.LatLng(goal.lat,  goal.lon)
    ];
    __routeLine = new Tmapv3.Polyline({
        map,
        path,
        strokeColor: '#1D4ED8',
        strokeWeight: 5,
        strokeOpacity: 0.9,
        lineCap: 'round'
    });
    try {
        const sw = new Tmapv3.LatLng(Math.min(start.lat, goal.lat), Math.min(start.lng, goal.lon));
        const ne = new Tmapv3.LatLng(Math.max(start.lat, goal.lat), Math.max(start.lng, goal.lon));
        map.fitBounds(new Tmapv3.LatLngBounds(sw, ne));
    } catch (_) {}
}