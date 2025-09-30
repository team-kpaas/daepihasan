// /js/map/mapCore.js
let map = null;
export function getMap(){ return map; }

/** 오버레이가 맵 클릭을 가로채지 않도록 전역 가드 */
function ensurePointerEventGuards(){
    const id = 'mapPointerGuard';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
    /* 지도는 항상 클릭 가능 */
    #map_div, #map_div * { pointer-events: auto !important; }

    /* 상단/하단 컨테이너는 기본적으로 클릭 '통과' */
    header, .bottom-bar, .fab-cluster, .zoom-controls, #sheet { pointer-events: none; }

    /* 필요한 요소만 다시 켬 */
    header .map-search-form, header .map-search-form *,
    .side-peek, .side-peek *,
    .chips, .chips *, .route-btn,
    .fab-cluster, .fab-cluster *,       /* FAB 버튼 */
    .zoom-controls, .zoom-controls *,   /* + / – */
    .search-suggest, .search-suggest *  /* 검색 제안 */
    { pointer-events: auto; }
  `;
    document.head.appendChild(style);
}

/** 컨테이너가 너무 작으면 기본 사이즈 부여 */
function ensureContainerSize(id='map_div'){
    const el = document.getElementById(id);
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h < 50){
        el.style.height = '60vh';
        el.style.width  = '100%';
        console.warn('[map] #map_div height too small → set 60vh');
    }
}

export function initMap(opts={}) {
    const id = opts.containerId || 'map_div';
    if (map) return map;
    if (!window.Tmapv3){ console.error('[map] Tmap SDK not loaded'); return null; }
    if (!document.getElementById(id)){ console.error('[map] #' + id + ' not found'); return null; }

    ensureContainerSize(id);
    ensurePointerEventGuards();

    const centerLat = opts.lat ?? 37.5652045;
    const centerLng = opts.lng ?? 126.98702028;
    const zoom      = opts.zoom ?? 16;

    map = new Tmapv3.Map(id, {
        center: new Tmapv3.LatLng(centerLat, centerLng),
        zoom
    });
    window.tmapMap = map;
    console.log('[map] ready', {centerLat, centerLng, zoom});

    // ✅ 클릭 디버깅: 두 API 모두 시도 + DOM fallback
    bindMapClickDebug(map);

    return map;
}

export async function initMapAsync(opts={}) {
    const id = opts.containerId || 'map_div';
    const timeout = opts.timeout ?? 8000, interval = opts.interval ?? 150;
    const t0 = Date.now();
    while((!window.Tmapv3) || (!document.getElementById(id))){
        if (Date.now() - t0 > timeout) throw new Error('Tmap SDK or #' + id + ' not ready');
        await new Promise(r=>setTimeout(r, interval));
    }
    return initMap(opts);
}

/** map 클릭 이벤트가 실제로 들어오는지 확실히 확인 */
function bindMapClickDebug(m){
    let bound = false;

    // 1) 신 API?
    try {
        if (typeof m.addListener === 'function') {
            m.addListener('click', (e)=>console.log('[map click] via map.addListener', e));
            bound = true;
        }
    } catch(e){ console.warn('[map] addListener failed', e); }

    // 2) 구 API (권장)
    try {
        if (Tmapv3?.Event?.addListener) {
            Tmapv3.Event.addListener(m, 'click', (e)=>console.log('[map click] via Tmapv3.Event.addListener', e));
            bound = true;
        }
    } catch(e){ console.warn('[map] Tmapv3.Event.addListener failed', e); }

    // 3) DOM fallback (맵 캔버스/컨테이너 직접)
    try {
        const container = document.getElementById('map_div');
        if (container) {
            ['click','pointerup','mouseup','touchend'].forEach(ev=>{
                container.addEventListener(ev, (e)=>console.log(`[map DOM ${ev}]`, e.target), {capture:true});
            });
        }
    } catch(e){}

    console.log('[map] click handlers bound =', bound);
}
