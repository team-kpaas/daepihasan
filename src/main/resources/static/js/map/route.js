// /js/map/route.js
import { getMap } from './mapCore.js';

/* ===== 앱키 읽기 ===== */
function getTmapKey(){
    return window.__TMAP_KEY__
        || document.querySelector('meta[name="tmap-key"]')?.content
        || '';
}

/* ===== 공통 포맷 ===== */
export function haversineMeters(a, b){
    const R = 6371000;
    const toRad = d => d * Math.PI/180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
}

/* ===== REST 호출 ===== */
export async function requestCarRoute(start, end, opts = {}){
    const appKey = getTmapKey();
    if (!appKey) throw new Error('Tmap appKey 없음');

    const url = 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json';
    const body = {
        startX: start.lng, startY: start.lat,
        endX:   end.lng,   endY:   end.lat,
        startName: opts.startName || '출발',
        endName:   opts.endName   || '도착',
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        searchOption: opts.searchOption ?? 0, // 0추천
        trafficInfo: 'N'
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'appKey': appKey },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
}

export async function requestPedRoute(start, end){
    const appKey = getTmapKey();
    if (!appKey) throw new Error('Tmap appKey 없음');

    const url = 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json';
    const body = {
        startX:start.lng, startY:start.lat,
        endX:end.lng,     endY:end.lat,
        startName:'출발', endName:'도착',
        reqCoordType:'WGS84GEO', resCoordType:'WGS84GEO'
    };
    const res = await fetch(url, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'appKey': appKey },
        body:JSON.stringify(body)
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
}

/* ===== 요약 추출 ===== */
function extractPedSummary(data){
    let dist = 0, time = 0, seenSummary = false;
    for (const f of (data?.features||[])) {
        const p = f.properties || {};
        // 일부 응답은 첫 feature에 totalDistance/totalTime 포함
        if (!seenSummary && (typeof p.totalDistance==='number' || typeof p.totalTime==='number')) {
            if (typeof p.totalDistance==='number') dist = p.totalDistance;
            if (typeof p.totalTime==='number')     time = p.totalTime;
            seenSummary = true;
        }
        // 없으면 구간 합산
        if (!seenSummary) {
            if (typeof p.distance==='number') dist += p.distance;
            if (typeof p.time==='number')     time += p.time;
        }
    }
    return { distanceMeters: dist||0, durationSec: time||0, mode: 'walk' };
}

function extractCarSummary(data){
    // 자동차 응답도 features 배열. distance/time(or totalTime) 형태 혼재 → 합산/요약 둘 다 시도
    let dist = 0, time = 0, seenSummary = false;
    for (const f of (data?.features||[])) {
        const p = f.properties || {};
        if (!seenSummary && (typeof p.totalDistance==='number' || typeof p.totalTime==='number')) {
            if (typeof p.totalDistance==='number') dist = p.totalDistance;
            if (typeof p.totalTime==='number')     time = p.totalTime;
            seenSummary = true;
        }
        if (!seenSummary) {
            if (typeof p.distance==='number') dist += p.distance;
            if (typeof p.time==='number')     time += p.time;
        }
    }
    return { distanceMeters: dist||0, durationSec: time||0, mode: 'car' };
}

/* ===== 그리기/정리 ===== */
let routeLine = null, startMarker = null, endMarker = null;

export function clearRoute(){
    routeLine?.setMap(null); routeLine = null;
    startMarker?.setMap?.(null); startMarker = null;
    endMarker?.setMap?.(null); endMarker = null;
}

export function drawRouteOnMap(map, geojson, style = {}){
    clearRoute();
    const pts = [];
    for(const f of (geojson?.features || [])){
        if (f.geometry?.type === 'LineString'){
            for(const [lon, lat] of f.geometry.coordinates){
                pts.push(new Tmapv3.LatLng(lat, lon));
            }
        }
    }
    if (!pts.length) throw new Error('경로 좌표 없음');

    routeLine = new Tmapv3.Polyline({
        map,
        path: pts,
        strokeColor: style.strokeColor || '#206def',
        strokeWeight: style.strokeWeight || 6,
        strokeOpacity: style.strokeOpacity || 0.9
    });

    const b = new Tmapv3.LatLngBounds(pts[0], pts[0]);
    pts.forEach(p => b.extend(p));
    map.fitBounds(b);
}

/* ===== 원클릭 길찾기(요약 반환) ===== */
export async function routeTo(lat, lng, opts = { mode: 'walk' }){
    const map = getMap();
    if (!map) throw new Error('map not ready');

    // 출발지: 내 위치(가능하면) → 실패 시 지도중심
    const start = await getStartPoint(map);
    const end   = { lat:+lat, lng:+lng };

    try {
        if (opts.mode === 'car') {
            const data = await requestCarRoute(start, end, opts);
            const summary = extractCarSummary(data);
            drawRouteOnMap(map, data);
            placeSE(map, start, end);
            return summary;
        } else {
            const data = await requestPedRoute(start, end);
            const summary = extractPedSummary(data);
            drawRouteOnMap(map, data);
            placeSE(map, start, end);
            return summary;
        }
    } catch (e) {
        // ❗ 폴백: 직선거리 기반 도보 추정 (1.2m/s ≈ 4.3km/h)
        const meters = haversineMeters(start, end);
        const secs   = Math.round(meters / 1.2);
        // 폴백 선 긋기
        try {
            clearRoute();
            routeLine = new Tmapv3.Polyline({
                map, path:[ new Tmapv3.LatLng(start.lat,start.lng), new Tmapv3.LatLng(end.lat,end.lng) ],
                strokeColor:'#888', strokeWeight:4, strokeOpacity:0.7, strokeStyle:'dash'
            });
            placeSE(map, start, end);
        } catch(_) {}
        return { distanceMeters: meters, durationSec: secs, mode: opts.mode || 'walk', fallback: true };
    }
}

function placeSE(map, start, end){
    startMarker?.setMap?.(null);
    endMarker?.setMap?.(null);
    startMarker = new Tmapv3.Marker({ map, position:new Tmapv3.LatLng(start.lat, start.lng), title:'출발' });
    endMarker   = new Tmapv3.Marker({ map, position:new Tmapv3.LatLng(end.lat,   end.lng),   title:'도착' });
}

function getBrowserLocation(timeout = 6000){
    return new Promise((resolve,reject)=>{
        if (!navigator.geolocation) return reject(new Error('geolocation 미지원'));
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            err => reject(err),
            { enableHighAccuracy:true, timeout }
        );
    });
}
async function getStartPoint(map){
    try { return await getBrowserLocation(6000); }
    catch(_) { const c = map.getCenter(); return { lat:c._lat, lng:c._lng }; }
}
