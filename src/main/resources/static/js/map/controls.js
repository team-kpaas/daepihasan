// /js/map/controls.js
import { showToast } from './utils.js';
import { getMap } from './mapCore.js';
import { refreshFacilitiesNow } from './facilities.js';   // ✅ 추가

export function bindControls(){
    document.getElementById('btnMyLocation')?.addEventListener('click', locateMe);
    document.getElementById('fabRefresh')?.addEventListener('click', refreshKeepView); // ✅ 변경
    document.getElementById('btnZoomIn') ?.addEventListener('click', ()=>{ const m=getMap(); if(!m) return; m.setZoom(Math.min((m.getZoom()||16)+1,19)); });
    document.getElementById('btnZoomOut')?.addEventListener('click', ()=>{ const m=getMap(); if(!m) return; m.setZoom(Math.max((m.getZoom()||16)-1,3)); });
}

async function refreshKeepView(){
    const m = getMap();
    if (!m) return;

    // 버튼 스피너(있으면)
    const btn = document.getElementById('fabRefresh');
    btn?.classList.add('spin-once');
    setTimeout(()=>btn?.classList.remove('spin-once'), 800);

    // 현재 뷰 저장
    const c = m.getCenter();
    const z = m.getZoom();

    // 컨테이너 리사이즈(레이아웃 변동 대비)
    try { m.resize(); } catch(_) {}

    // 뷰 유지
    if (c) m.setCenter(c);
    if (z != null) m.setZoom(z);

    // 시설 다시 가져와 렌더
    try {
        await refreshFacilitiesNow(m);
        showToast('새로고침 완료');
    } catch (e) {
        console.warn('[refresh] failed', e);
    }
}

function locateMe() {
    const btn = document.getElementById('btnMyLocation');
    if (!navigator.geolocation) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return; }
    btn?.classList.add('loading');

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const m = getMap(); const here = new Tmapv3.LatLng(pos.coords.latitude, pos.coords.longitude);
            m?.setCenter(here); m?.setZoom(17);
            new Tmapv3.Marker({ map:m, position:here, title:'내 위치' });
            btn?.classList.remove('loading'); showToast('내 위치로 이동했습니다.');
        },
        () => { btn?.classList.remove('loading'); alert('위치를 가져오지 못했습니다.'); },
        { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
    );
}
