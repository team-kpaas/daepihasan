
import { TYPE_LABELS, HYDRANT_MIN_ZOOM, CLUSTER_UNTIL_ZOOM } from './config.js';
import { getMap } from './mapCore.js';
import { joinCtx } from './ctx.js';
import { showToast } from './utils.js';

const FAC_DEBUG = true;
const SERVER_FILTER = false;


export const ACTIVE_TYPES = new Set(['hydrant']); // 기본 ON
let FAC_MARKERS = [];                               // [{marker, pos, data, isCluster}]
const CODE_TO_TYPE = {
    1: 'hydrant',      // 소화전
    2: 'tower',        // 예: 급수탑  (확인 후 조정)
    6: 'ebox',         // 비상소화장치
    4: 'reservoir',    // 저수조 (없으면 빼도 됨)
};

const TYPE_TO_CODE = {
    hydrant: 1,
    tower: 2,
    ebox: 6,
    reservoir: 4,
};

export function getFacilityMarkers(){ return FAC_MARKERS; }

export function clearFacilityMarkers(){
    FAC_MARKERS.forEach(m => m.marker?.setMap && m.marker.setMap(null));
    FAC_MARKERS = [];
    window.__facilityMarkers = FAC_MARKERS; // 디버그용
}

// 기존 함수 교체
export function normalizeType(it){
    // 숫자 코드 우선
    const raw = it.facilityTypeCd ?? it.type ?? it.facility_type_cd;
    const n = Number(raw);
    if (!Number.isNaN(n) && CODE_TO_TYPE[n]) return CODE_TO_TYPE[n];

    // 문자열 방어(혹시 다른 소스가 섞일 때)
    const s = (raw ?? '').toString().toLowerCase();
    if (s.includes('급수') || s.includes('tower')) return 'tower';
    if (s.includes('비상') || s.includes('ebox'))  return 'ebox';
    if (s.includes('저수') || s.includes('reserv')) return 'reservoir';
    if (s.includes('소화전') || s.includes('hydrant')) return 'hydrant';

    return 'hydrant';
}


function markerIconOption(typeKey){
    const urlMap = {
        hydrant:   joinCtx('/images/map/hydrant.png'),
        tower:     joinCtx('/images/map/tower.png'),
        ebox:      joinCtx('/images/map/ebox.png'),
        reservoir: joinCtx('/images/map/reservoir.png'),
    };
    const url = urlMap[typeKey] || urlMap.hydrant;
    return { icon: url, iconSize: new Tmapv3.Size(32, 32) };
}

function getCurrentBBox(){
    const tmap = getMap(); if (!tmap) return null;
    const b = tmap.getBounds(); const { _sw: sw, _ne: ne } = b;
    return { minLat: sw._lat, maxLat: ne._lat, minLon: sw._lng, maxLon: ne._lng };
}


function buildTypesQuery(arr){
    if (!SERVER_FILTER) return '';
    const codes = arr.map(t => TYPE_TO_CODE[t]).filter(Boolean);
    return codes.length ? '&types=' + codes.join(',') : '';
}
function dist2(clat, clon, lat, lon){
    const dlat = (+lat - clat);
    const dlon = (+lon - clon);
    return dlat*dlat + dlon*dlon;
}

export async function fetchFacilitiesInView(){
    const bbox = getCurrentBBox(); if (!bbox) return [];

    // 아무 칩도 선택 안 했으면 요청 자체 생략
    const selected = [...ACTIVE_TYPES];
    if (!selected.length) return [];

    // 소화전은 축소 상태에선 숨김
    const z = getMap()?.getZoom() ?? 16;
    let eff = [...selected];
    if (z < HYDRANT_MIN_ZOOM && eff.includes('hydrant')) {
        eff = eff.filter(t => t !== 'hydrant');
        if (!eff.length) return [];
        showToast('소화전은 지도를 더 확대하면 표시됩니다 (z≥16)');
    }

    const params = new URLSearchParams(bbox).toString();
    // ★ 서버 types 파라미터에 의존하지 말고(환경마다 달라짐) 전체를 받아서 클라에서 필터
    const url = `${joinCtx('/api/facility/bbox')}?${params}`;

    const res  = await fetch(url);
    if (!res.ok) return [];
    let list = await res.json();

    // 선택 타입만 남김
    list = list.filter(it => eff.includes(normalizeType(it)));

    // 지도 중심에서 가까운 순 정렬 후 10개만
    const c = getMap().getCenter(); const clat = c._lat, clon = c._lng;
    list.sort((a,b) => dist2(clat,clon,a.lat,a.lon) - dist2(clat,clon,b.lat,b.lon));
    return list.slice(0, 10);
}

export function makeClusterIcon(count){
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <circle cx="20" cy="20" r="18" fill="#ff3b30" fill-opacity=".9"/>
  <circle cx="20" cy="20" r="13" fill="#fff"/>
  <text x="20" y="24" text-anchor="middle" font-size="13" font-family="system-ui" fill="#ff3b30">${count}</text>
</svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

export function clusterHydrants(items){
    const z = getMap()?.getZoom() ?? 16;
    if (z > CLUSTER_UNTIL_ZOOM || !items?.length) return items;
    const cellPx = z <= 14 ? 80 : 60;
    const degPerPxLon = 360 / (256 * Math.pow(2, z));
    const step = cellPx * degPerPxLon;

    const buckets = new Map();
    for (const it of items){
        const lat = +it.lat, lon = +it.lon; if (isNaN(lat)||isNaN(lon)) continue;
        const key = Math.floor(lon/step)+','+Math.floor(lat/step);
        let b = buckets.get(key); if (!b){ b={sumLat:0,sumLon:0,count:0,sample:it}; buckets.set(key,b); }
        b.sumLat+=lat; b.sumLon+=lon; b.count++;
    }
    const out=[];
    for (const b of buckets.values()){
        if (b.count===1) out.push(b.sample);
        else out.push({lat:b.sumLat/b.count, lon:b.sumLon/b.count, isCluster:true, count:b.count, facilityTypeCd:'hydrant', name:`${b.count}개 소화전`});
    }
    return out;
}

export function renderFacilities(map, items){
    clearFacilityMarkers();
    console.log('[fac] render items =', items.length);

    items.forEach((it) => {
        const pos = new Tmapv3.LatLng(+it.lat, +it.lon);
        const typeKey = normalizeType(it);

        const iconOpt = it.isCluster
            ? { icon: makeClusterIcon(it.count), iconSize: new Tmapv3.Size(40,40) }
            : markerIconOption(typeKey);

        const marker = new Tmapv3.Marker({
            map,
            position: pos,
            title: it.name || TYPE_LABELS[typeKey] || '소방용수시설',
            clickable: true,
            zIndex: it.isCluster ? 1002 : 1001,
            ...iconOpt,
        });

        // 이벤트는 지도에서 근접 픽업으로 처리하므로 여기서는 바인딩하지 않음
        FAC_MARKERS.push({ marker, pos, data: it, isCluster: !!it.isCluster });
    });

    window.__facilityMarkers = FAC_MARKERS; // 디버그
}

export function updateFacilityStatus(items){
    const el = document.getElementById('facStatus'); if (!el) return;
    el.textContent = `화면 내 ${items.length}개`;
}

export async function refreshFacilitiesNow(map){
    let list = await fetchFacilitiesInView();
    const onlyHydrant = (ACTIVE_TYPES.size === 1 && ACTIVE_TYPES.has('hydrant'));
    if (onlyHydrant && list.length > 800) list = clusterHydrants(list);
    renderFacilities(map, list);
    updateFacilityStatus(list);
}
function countBy(arr){
    const m = {};
    for (const k of arr) m[k] = (m[k]||0)+1;
    return m;
}