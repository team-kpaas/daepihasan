// /* /js/map/facilities.js */
// import { TYPE_LABELS, HYDRANT_MIN_ZOOM, CLUSTER_UNTIL_ZOOM } from './config.js';
// import { getMap } from './mapCore.js';
// import { apiUrl, joinCtx } from './ctx.js';
// import { showPoiCard } from './poiCard.js';
// import { showToast } from './utils.js';
//
// export const ACTIVE_TYPES = new Set(['hydrant']);  // 기본 ON
// let facilityMarkers = [];
//
// /* ---------- helpers ---------- */
// export function clearFacilityMarkers() {
//     facilityMarkers.forEach(m => m.setMap && m.setMap(null));
//     facilityMarkers = [];
// }
//
// //  09-15
// function attachMarkerClick(marker, handler){
//     if (!marker || typeof handler !== 'function') return;
//
//     try {
//         // Tmap v3 새 API
//         if (typeof marker.addListener === 'function') {
//             marker.addListener('click', handler);
//             return;
//         }
//     } catch(e){ console.warn('[marker] addListener (new) failed', e); }
//
//     try {
//         // Tmap v3 구 API
//         if (Tmapv3?.Event?.addListener) {
//             Tmapv3.Event.addListener(marker, 'click', handler);
//             return;
//         }
//     } catch(e){ console.warn('[marker] addListener (old) failed', e); }
//
//     console.warn('[marker] no click API available');
// }
// //
//
// export function normalizeType(it) {
//     const raw = (it.facilityTypeCd || it.type || '').toString().toLowerCase().trim();
//     if (/hydrant|소화전|^h(y)?$|^10$/.test(raw)) return 'hydrant';
//     if (/tower|급수탑|^t(ower)?$|^20$/.test(raw)) return 'tower';
//     if (/ebox|비상소화|^e(box)?$|^30$/.test(raw)) return 'ebox';
//     if (/reservoir|저수조|^r(eservoir)?$|^40$/.test(raw)) return 'reservoir';
//     return 'hydrant';
// }
//
// function markerIconOption(typeKey) {
//     const map = {
//         hydrant:   joinCtx('/images/map/hydrant.png'),
//         tower:     joinCtx('/images/map/tower.png'),
//         ebox:      joinCtx('/images/map/ebox.png'),
//         reservoir: joinCtx('/images/map/reservoir.png'),
//     };
//     const url = map[typeKey] || map.hydrant;
//     return { icon: url, iconSize: new Tmapv3.Size(28, 28) };
// }
//
// function getCurrentBBox() {
//     const tmap = getMap(); if (!tmap) return null;
//     const b = tmap.getBounds(); if (!b) return null;
//     const { _sw: sw, _ne: ne } = b;
//     return { minLat: sw._lat, maxLat: ne._lat, minLon: sw._lng, maxLon: ne._lng };
// }
//
// function buildTypesQuery(arr) {
//     const all = Object.keys(TYPE_LABELS);
//     if (!arr.length || arr.length === all.length) return '';
//     return '&types=' + encodeURIComponent(arr.join(','));
// }
//
// /* ---------- fetch & cluster ---------- */
// export async function fetchFacilitiesInView() {
//     const bbox = getCurrentBBox(); if (!bbox) return [];
//     const z = getMap()?.getZoom() ?? 16;
//
//     let types = [...ACTIVE_TYPES];
//     if (z < HYDRANT_MIN_ZOOM && types.includes('hydrant')) {
//         types = types.filter(t => t !== 'hydrant');
//         showToast('소화전은 지도를 더 확대하면 표시됩니다 (z≥16)');
//     }
//
//     const params = new URLSearchParams(bbox).toString();
//     const url = `${apiUrl('/api/facility/bbox')}?${params}${buildTypesQuery(types)}`;
//
//     try {
//         const res = await fetch(url);
//         if (!res.ok) return [];
//         let list = await res.json();
//         if (types.length && types.length < Object.keys(TYPE_LABELS).length) {
//             list = list.filter(it => types.includes(normalizeType(it)));
//         }
//         return list;
//     } catch (e) {
//         console.warn('[facilities] fetch error', e);
//         return [];
//     }
// }
//
// export function makeClusterIcon(count) {
//     const svg = `
// <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34">
//   <circle cx="17" cy="17" r="16" fill="#ff3b30" fill-opacity=".9"/>
//   <circle cx="17" cy="17" r="12" fill="#fff"/>
//   <text x="17" y="21" text-anchor="middle" font-size="12" font-family="system-ui" fill="#ff3b30">${count}</text>
// </svg>`;
//     return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
// }
//
// export function clusterHydrants(items) {
//     const z = getMap()?.getZoom() ?? 16;
//     if (z > CLUSTER_UNTIL_ZOOM || !items?.length) return items;
//
//     const cellPx = z <= 14 ? 80 : 60;
//     const degPerPxLon = 360 / (256 * Math.pow(2, z));
//     const step = cellPx * degPerPxLon;
//
//     const buckets = new Map();
//     for (const it of items) {
//         const lat = +it.lat, lon = +it.lon;
//         if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
//         const key = Math.floor(lon/step)+','+Math.floor(lat/step);
//         let b = buckets.get(key);
//         if (!b) { b = { sumLat:0, sumLon:0, count:0, sample: it }; buckets.set(key, b); }
//         b.sumLat += lat; b.sumLon += lon; b.count++;
//     }
//
//     const out = [];
//     for (const b of buckets.values()) {
//         if (b.count === 1) out.push(b.sample);
//         else out.push({
//             lat: b.sumLat / b.count,
//             lon: b.sumLon / b.count,
//             isCluster: true,
//             count: b.count,
//             name: `${b.count}개 소화전`,
//             facilityTypeCd: 'hydrant'
//         });
//     }
//     return out;
// }
//
// /* ---------- render ---------- */
// function updateFacilityStatus(items) {
//     const el = document.getElementById('facStatus');
//     if (!el) return;
//     el.textContent = `화면 내 ${items.length}개`;
// }
//
// // export function renderFacilities(items, mapArg) {
// //     const map = mapArg || getMap();
// //     if (!map) {
// //         console.warn('[facilities] render skipped: map not ready');
// //         return;
// //     }
// //
// //     clearFacilityMarkers();
// //
// //     items.forEach((it) => {
// //         const pos = new Tmapv3.LatLng(+it.lat, +it.lon);
// //         const typeKey = normalizeType(it);
// //
// //         const iconOpt = it.isCluster
// //             ? { icon: makeClusterIcon(it.count), iconSize: new Tmapv3.Size(34,34) }
// //             : markerIconOption(typeKey);
// //
// //         const marker = new Tmapv3.Marker({
// //             map,
// //             position: pos,
// //             title: it.name || TYPE_LABELS[typeKey] || '소방용수시설',
// //             clickable: true,
// //             zIndex: it.isCluster ? 1002 : 1001,
// //             ...iconOpt,
// //         });
// //
// //         // 안전한 이벤트 바인딩 (두 API 모두 시도)
// //         const handler = () => {
// //             console.log('[marker] click', it);
// //             if (it.isCluster) {
// //                 try {
// //                     map.setCenter(pos);
// //                     map.setZoom(Math.min((map.getZoom() || 16) + 1, 19));
// //                 } catch(_) {}
// //                 return;
// //             }
// //             showPoiCard(it);
// //         };
// //
// //         if (typeof marker.addListener === 'function') {
// //             marker.addListener('click', handler);
// //         } else if (Tmapv3 && Tmapv3.Event && typeof Tmapv3.Event.addListener === 'function') {
// //             Tmapv3.Event.addListener(marker, 'click', handler);
// //         } else {
// //             console.warn('[facilities] no event API for marker');
// //         }
// //
// //         facilityMarkers.push(marker);
// //     });
// //
// //     updateFacilityStatus(items);
// // }
// export function renderFacilities(items, mapArg) {
//     const map = mapArg || getMap();
//     if (!map) {
//         console.warn('[facilities] render skipped: map not ready');
//         return;
//     }
//
//     clearFacilityMarkers();
//
//     items.forEach((it) => {
//         const pos = new Tmapv3.LatLng(+it.lat, +it.lon);
//         const typeKey = normalizeType(it);
//
//         const iconOpt = it.isCluster
//             ? { icon: makeClusterIcon(it.count), iconSize: new Tmapv3.Size(34,34) }
//             : markerIconOption(typeKey);
//
//         const marker = new Tmapv3.Marker({
//             map,
//             position: pos,
//             title: it.name || TYPE_LABELS[typeKey] || '소방용수시설',
//             clickable: true,
//             zIndex: it.isCluster ? 1002 : 1001,
//             ...iconOpt,
//         });
//
//         // ✅ 클릭하면 콘솔 + 카드
//         attachMarkerClick(marker, () => {
//             console.log('[marker] click', it);        // ← 콘솔에서 확인 가능
//             if (it.isCluster) {
//                 try {
//                     map.setCenter(pos);
//                     map.setZoom(Math.min((map.getZoom() || 16) + 1, 19));
//                 } catch(_) {}
//                 return;
//             }
//             showPoiCard(it);                           // ← 같은 카드 영역에 내용 교체
//         });
//
//         facilityMarkers.push(marker);
//     });
//
//     updateFacilityStatus(items);
// }
//
// /* ---------- refresh ---------- */
// export async function refreshFacilitiesNow(mapArg) {
//     const map = mapArg || getMap();
//     if (!map) {
//         console.warn('[facilities] refresh skipped: map not ready');
//         return;
//     }
//     let list = await fetchFacilitiesInView();
//
//     const onlyHydrant = (ACTIVE_TYPES.size === 1 && ACTIVE_TYPES.has('hydrant'));
//     if (onlyHydrant && list.length > 800) {
//         list = clusterHydrants(list);
//     }
//     renderFacilities(list, map);
// }
// /js/map/facilities.js
// /js/map/facilities.js
// /js/map/facilities.js
// /js/map/facilities.js
// /js/map/facilities.js
import { TYPE_LABELS, HYDRANT_MIN_ZOOM, CLUSTER_UNTIL_ZOOM } from './config.js';
import { getMap } from './mapCore.js';
import { joinCtx } from './ctx.js';
import { showToast } from './utils.js';

export const ACTIVE_TYPES = new Set(['hydrant']); // 기본 ON
let FAC_MARKERS = [];                               // [{marker, pos, data, isCluster}]

export function getFacilityMarkers(){ return FAC_MARKERS; }

export function clearFacilityMarkers(){
    FAC_MARKERS.forEach(m => m.marker?.setMap && m.marker.setMap(null));
    FAC_MARKERS = [];
    window.__facilityMarkers = FAC_MARKERS; // 디버그용
}

export function normalizeType(it){
    const raw = (it.facilityTypeCd || it.type || '').toString().toLowerCase();
    if (raw.includes('tower')) return 'tower';
    if (raw.includes('ebox') || raw.includes('비상')) return 'ebox';
    if (raw.includes('reservoir') || raw.includes('저수')) return 'reservoir';
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
    const keys = Object.keys(TYPE_LABELS);
    if (!arr.length || arr.length === keys.length) return '';
    return '&types=' + encodeURIComponent(arr.join(','));
}

export async function fetchFacilitiesInView(){
    const bbox = getCurrentBBox(); if (!bbox) return [];
    const z = getMap()?.getZoom() ?? 16;

    let types = [...ACTIVE_TYPES];
    if (z < HYDRANT_MIN_ZOOM && types.includes('hydrant')){
        types = types.filter(t => t !== 'hydrant');
        showToast('소화전은 지도를 더 확대하면 표시됩니다 (z≥16)');
    }

    const params = new URLSearchParams(bbox).toString();
    const url = `${joinCtx('/api/facility/bbox')}?${params}${buildTypesQuery(types)}`;

    try{
        const res = await fetch(url);
        if (!res.ok) return [];
        let list = await res.json();

        // 타입 필터 (서버가 미지원일 때)
        if (types.length) list = list.filter(it => types.includes(normalizeType(it)));

        // ✅ 최대 10개로 제한
        return list.slice(0, 10);
    }catch(e){
        console.warn('[facilities] fetch error', e);
        return [];
    }
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
