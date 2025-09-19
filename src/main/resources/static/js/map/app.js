// /js/map/app.js
import { initMapAsync } from './mapCore.js';
import { refreshFacilitiesNow, getFacilityMarkers, normalizeType, ACTIVE_TYPES } from './facilities.js';
import { setupSearchSuggest } from './search.js';
import { showPoiCard } from './poiCard.js';
import { debounce } from './utils.js';
import { bindControls } from './controls.js';
import { bindSidebar } from './sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    boot().catch(err => console.error('[app] map init failed:', err));
});

async function boot(){
    const map = await initMapAsync({ containerId: 'map_div', zoom: 16 });
    if (!map) throw new Error('Map instance not created');

    setupSearchSuggest(map);
    bindControls();
    bindSidebar();
    bindChips(map);

    // 이동/확대 시 시설 자동 새로고침
    const onMove = debounce(() => refreshFacilitiesNow(map), 250);
    map.addListener('dragend', onMove);
    map.addListener('zoomend', onMove);

    // Tmap 클릭 이벤트
    try {
        map.addListener('click', (e) => {
            const ll = e?.latLng || e?.LatLng || e;
            if (ll && (ll._lat ?? ll.lat) != null) {
                pickNearest(map, (ll._lat ?? ll.lat), (ll._lng ?? ll.lng), '[pick/tmap]');
            }
        });
    } catch(_) {}

    // DOM 클릭 Fallback
    const container = document.getElementById('map_div');
    container.addEventListener('click', (ev) => {
        const ll = screenToLatLng(map, container, ev);
        if (!ll) return;
        pickNearest(map, ll.lat, ll.lng, '[pick/dom]');
    }, true);

    // 칩 바 위치 1회 계산 + 옵저버/리스너
    positionChipsBar();
    wireChipsBarReposition();

    // 첫 렌더
    await refreshFacilitiesNow(map);
}

function screenToLatLng(map, container, ev){
    try{
        const rect = container.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const b = map.getBounds(); const sw = b._sw, ne = b._ne;
        const width = rect.width, height = rect.height;
        if (width <= 0 || height <= 0) return null;
        const lon = sw._lng + (x/width)  * (ne._lng - sw._lng);
        const lat = ne._lat - (y/height) * (ne._lat - sw._lat);
        return { lat, lng: lon };
    }catch(e){ console.warn('[screenToLatLng] failed', e); return null; }
}

function pickNearest(map, clat, clon, tag='[pick]'){
    const z = map.getZoom() || 16;
    const degPerPxLon = 360 / (256 * Math.pow(2, z));
    const tol = degPerPxLon * 16; // 16px 반경

    const list = getFacilityMarkers(); // [{pos:{_lat,_lng}, data:{...}, isCluster:boolean}]
    let hit = null, bestD = Infinity;
    for (const m of list){
        const d = Math.hypot(m.pos._lng - clon, m.pos._lat - clat);
        if (d < bestD){ bestD = d; hit = m; }
    }

    if (hit && bestD <= tol){
        if (hit.isCluster){
            try { map.setCenter(hit.pos); map.setZoom(Math.min(z + 1, 19)); } catch(_){}
        } else {
            // ✅ 타입키 같이 넘기기
            showPoiCard(hit.data, normalizeType(hit.data));
        }
    } else {
        console.log(tag, 'no marker', { bestD, tol, z, total: list.length });
    }
}

/* ───── 칩 바 위치 고정: 검색창 바로 아래에 붙이기 ───── */
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

function wireChipsBarReposition(){
    // 창/스크롤/회전
    window.addEventListener('resize', positionChipsBar);
    window.addEventListener('scroll', positionChipsBar, { passive: true });
    window.addEventListener('orientationchange', positionChipsBar);

    // 검색창 자체 크기 변경(반응형, 폰트 로딩 등)
    const form = document.querySelector('.map-search-form');
    if (form && 'ResizeObserver' in window){
        const ro = new ResizeObserver(() => positionChipsBar());
        ro.observe(form);
    }

    // 입력 중에도 살짝 보정
    document.getElementById('mapSearchInput')?.addEventListener('input', () => {
        requestAnimationFrame(positionChipsBar);
    });
}
function bindChips(map){
    const chips = document.querySelectorAll('.chips .chip');
    chips.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            const type = btn.dataset.type;                 // hydrant | tower | ebox | reservoir
            const wasOn = btn.classList.contains('is-on');

            // 모두 끔
            chips.forEach(b => b.classList.remove('is-on'));
            ACTIVE_TYPES.clear();

            // 다시 켬(토글)
            if (!wasOn) {
                btn.classList.add('is-on');
                ACTIVE_TYPES.add(type);
            }

            refreshFacilitiesNow(map);
        }, { passive:false });
    });
}