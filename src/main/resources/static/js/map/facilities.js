// /js/map/facilities.js  — HYDRANT ONLY
import { TYPE_LABELS, CLUSTER_UNTIL_ZOOM } from './config.js';
import { getMap } from './mapCore.js';
import { joinCtx } from './ctx.js';

const FAC_DEBUG     = true;
const SERVER_FILTER = false;              // 서버에서 types 필터 지원하면 true로
const LIMIT = 30;

// 코드/타입 매핑: 소화전(1)만 남김
const CODE_TO_TYPE = { 1: 'hydrant' };
const TYPE_TO_CODE = { hydrant: 1 };

// 외부 노출 상태: 항상 소화전만
export const ACTIVE_TYPES = new Set(['hydrant']);

// 내부 마커 저장소
let markerMap = new Map();
let FAC_MARKERS = [];
export function getFacilityMarkers(){ return FAC_MARKERS; }

export function clearFacilityMarkers(){
    markerMap.forEach(v => v.marker?.setMap && v.marker.setMap(null));
    markerMap.clear();
    FAC_MARKERS = [];
    if (FAC_DEBUG) window.__facilityMarkers = FAC_MARKERS;
}

/* ── utils ─────────────────────────────────────────────────── */
const iconUrl = joinCtx('/images/map/hydrant.png');
const SIZE_32 = new Tmapv3.Size(32,32);
const SIZE_40 = new Tmapv3.Size(40,40);

function makeClusterIcon(count){
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <circle cx="20" cy="20" r="18" fill="#ff3b30" fill-opacity=".9"/>
  <circle cx="20" cy="20" r="13" fill="#fff"/>
  <text x="20" y="24" text-anchor="middle" font-size="13" font-family="system-ui" fill="#ff3b30">${count}</text>
</svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// 항상 'hydrant'
export function normalizeType(){ return 'hydrant'; }

// 소화전 여부(서버 응답 안전 필터)
function isHydrant(it){
    const raw = it.facilityTypeCd ?? it.type ?? it.facility_type_cd;
    const n = Number(raw);
    if (!Number.isNaN(n)) return n === 1;
    const s = (raw ?? '').toString().toLowerCase();
    return /hydrant|소화전|^1$|^10$/.test(s);
}

function buildTypesQuery(arr){
    if (!SERVER_FILTER) return '';
    const codes = arr.map(t => TYPE_TO_CODE[t]).filter(Boolean);
    return codes.length ? '&types=' + codes.join(',') : '';
}

/* ── fetch / filter ────────────────────────────────────────── */
export async function fetchFacilitiesInView(){
    const map = getMap();
    const limit = LIMIT;

    const b = map.getBounds();
    const c = map.getCenter();

    const params = new URLSearchParams({
        minLat: b._sw._lat, maxLat: b._ne._lat,
        minLon: b._sw._lng, maxLon: b._ne._lng,
        clat: c._lat, clon: c._lng,
        limit
    });

    const url = `${joinCtx('/api/facility/bbox')}?${params}${buildTypesQuery([...ACTIVE_TYPES])}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    let list = await res.json();

    // 🔒 소화전만 남김
    list = list.filter(isHydrant);

    return list;
}

/* ── 클러스터(소화전 다량일 때만) ──────────────────────────── */
export function clusterHydrants(items){
    const z = getMap()?.getZoom() ?? 16;
    if (z > CLUSTER_UNTIL_ZOOM || !items?.length) return items;

    const cellPx = z <= 14 ? 80 : 60;
    const degPerPxLon = 360 / (256 * Math.pow(2, z));
    const step = cellPx * degPerPxLon;

    const buckets = new Map();
    for (const it of items){
        const lat = +it.lat, lon = +it.lon; if (!Number.isFinite(lat)||!Number.isFinite(lon)) continue;
        const key = Math.floor(lon/step)+','+Math.floor(lat/step);
        let b = buckets.get(key); if (!b){ b={sumLat:0,sumLon:0,count:0,sample:it}; buckets.set(key,b); }
        b.sumLat+=lat; b.sumLon+=lon; b.count++;
    }
    const out=[];
    for (const b of buckets.values()){
        if (b.count===1) out.push(b.sample);
        else out.push({lat:b.sumLat/b.count, lon:b.sumLon/b.count, isCluster:true, count:b.count, facilityTypeCd:1, name:`${b.count}개 소화전`});
    }
    return out;
}

/* ── 렌더 ──────────────────────────────────────────────────── */
function upsertMarker(map, item){
    const lat = +item.lat, lon = +item.lon;
    const pos = new Tmapv3.LatLng(lat, lon);
    const key = (item.id != null) ? String(item.id) : `@${lat.toFixed(6)},${lon.toFixed(6)}`;

    let rec = markerMap.get(key);
    if (rec){
        const mk = rec.marker;
        if (mk && (rec.pos._lat !== pos._lat || rec.pos._lng !== pos._lng)){
            mk.setPosition?.(pos);
            rec.pos = pos;
        }
        rec.data = item;
        rec.isCluster = !!item.isCluster;
        return;
    }

    const opt = item.isCluster
        ? { icon: makeClusterIcon(item.count), iconSize: SIZE_40, zIndex: 1002 }
        : { icon: iconUrl, iconSize: SIZE_32, zIndex: 1001 };

    const marker = new Tmapv3.Marker({
        map, position: pos,
        title: item.name || TYPE_LABELS.hydrant || '소화전',
        clickable: true, ...opt,
    });

    rec = { marker, pos, data: item, isCluster: !!item.isCluster };
    markerMap.set(key, rec);
}

function rebuildArrayView(){
    FAC_MARKERS = Array.from(markerMap.values());
    if (FAC_DEBUG) window.__facilityMarkers = FAC_MARKERS;
}

export function renderFacilities(map, items){
    const nextKeys = new Set();
    for (const it of items){
        upsertMarker(map, it);
        const lat = +it.lat, lon = +it.lon;
        nextKeys.add((it.id != null) ? String(it.id) : `@${lat.toFixed(6)},${lon.toFixed(6)}`);
    }
    markerMap.forEach((rec, key) => {
        if (!nextKeys.has(key)){
            rec.marker?.setMap && rec.marker.setMap(null);
            markerMap.delete(key);
        }
    });
    rebuildArrayView();
    if (FAC_DEBUG) console.log('[fac] render items =', items.length, 'markers =', FAC_MARKERS.length);
}

export function updateFacilityStatus(items){
    const el = document.getElementById('facStatus'); if (!el) return;
    el.textContent = `화면 내 ${items.length}개`;
}

/* ── 새로고침 ──────────────────────────────────────────────── */
const MOVE_MIN_M = 30;
let _lastFetch = { lat: null, lng: null, zoom: null };

function metersBetween(a, b) {
    const toRad = d => d * Math.PI/180, R = 6371000;
    const dLat = toRad(a.lat - b.lat), dLon = toRad(a.lng - b.lng);
    const la1 = toRad(b.lat), la2 = toRad(a.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

export function needFetchNow(map, force=false){
    if (force) return true;
    const c = map.getCenter();
    const zoom = map.getZoom();
    if (_lastFetch.zoom !== zoom) return true;
    if (_lastFetch.lat == null) return true;
    const d = metersBetween({lat:c._lat, lng:c._lng}, {lat:_lastFetch.lat, lng:_lastFetch.lng});
    return d > MOVE_MIN_M;
}
export function markFetched(map){
    const c = map.getCenter(); _lastFetch = { lat: c._lat, lng: c._lng, zoom: map.getZoom() };
}

export async function refreshFacilitiesNow(map, force=false){
    if (!needFetchNow(map, force)) return;
    let list = await fetchFacilitiesInView();
    if (list.length > 800) list = clusterHydrants(list); // 소화전만 → 많을 때만 클러스터
    renderFacilities(map, list);
    updateFacilityStatus(list);
    markFetched(map);
}
