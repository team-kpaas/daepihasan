// /js/map/poiCard.js
import { TYPE_LABELS } from './config.js';
import { escapeHtml, formatMeters, formatDurationSec } from './utils.js';
import { routeTo, clearRoute } from './route.js';     // ✅ 이름수입

let el = null;
function ensureStyles(){ /* 기존 + 아래 pill 스타일만 추가 */
    if (document.getElementById('poiCardStyle')) return;
    const s = document.createElement('style'); s.id='poiCardStyle';
    s.textContent = `
    .poi-card{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
      max-width:560px;width:calc(100% - 24px);background:#fff;color:#111;border-radius:14px;
      box-shadow:0 10px 30px rgba(0,0,0,.18);padding:14px 16px;z-index:2147483647;
      border:1px solid rgba(0,0,0,.06)}
    .poi-card.hide{display:none}
    .poi-card .head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
    .poi-card .title{font-weight:800;font-size:16px;line-height:1.2;flex:1}
    .poi-card .typechip{font-size:12px;padding:2px 8px;border-radius:999px;background:#eef2ff;color:#3740ff}
    .poi-card .line{font-size:13px;color:#444;margin:2px 0}.poi-card .muted{color:#777}
    .poi-card .row{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
    .poi-card .btn{border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:8px 12px;cursor:pointer;font-size:13px}
    .poi-card .btn:hover{background:#f9fafb}
    .poi-card .btn.primary{background:#206def;color:#fff;border-color:#206def}
    .poi-card .btn.primary:hover{filter:brightness(.98)}
    .poi-card .close{margin-left:auto;border:none;background:transparent;font-size:18px;line-height:1;cursor:pointer}
    .poi-card .pill{display:inline-block;background:#eef2ff;color:#3740ff;border-radius:999px;padding:2px 8px;margin-right:6px;font-size:11px}
  `;
    document.head.appendChild(s);
}

export function showPoiCard(it, typeKey) {
    ensureStyles();
    if (!el) { el = document.createElement('div'); el.className='poi-card hide'; document.body.appendChild(el); }
    const typeName = TYPE_LABELS[typeKey] || '시설';
    const addr = it.roadAddr || it.roadAddress || it.road || it.address || it.addr || it.jibunAddress || it.jibun || '';

    el.innerHTML = `
    <div class="head">
      <div class="typechip">${typeName}</div>
      <div class="title">${escapeHtml(it.name || it.facName || typeName)}</div>
      <button class="close" title="닫기" aria-label="닫기">×</button>
    </div>
    ${addr ? `<div class="line"><span class="muted">도로명</span> ${escapeHtml(addr)}</div>` : ''}

    <!-- 예상 소요시간/거리 출력 영역 -->
    <div class="line" id="poiRouteInfo" style="display:none;"></div>

    <div class="row">
      <button class="btn primary" id="poiRouteWalkBtn">도보 길찾기</button>
      <button class="btn" id="poiRouteCarBtn">자동차 길찾기</button>
      <button class="btn" id="poiClearRouteBtn">경로 지우기</button>
    </div>
  `;

    el.querySelector('.close').onclick = hidePoiCard;

    const infoEl = el.querySelector('#poiRouteInfo');
    const showInfo = (mode, secs, meters, fallback=false) => {
        infoEl.style.display = 'block';
        const modeLabel = mode === 'car' ? '자동차' : '도보';
        const extra = fallback ? ' (대략)' : '';
        infoEl.innerHTML = `<span class="pill">${modeLabel}</span>${formatDurationSec(secs)} · ${formatMeters(meters)}${extra}`;
    };

    // 도보
    el.querySelector('#poiRouteWalkBtn').onclick = async () => {
        try {
            const s = await routeTo(+it.lat, +it.lon, { mode:'walk' });
            showInfo(s.mode, s.durationSec, s.distanceMeters, !!s.fallback);
        } catch(e) { alert('길찾기 실패: ' + (e?.message || e)); }
    };

    // 자동차
    el.querySelector('#poiRouteCarBtn').onclick = async () => {
        try {
            const s = await routeTo(+it.lat, +it.lon, { mode:'car' });
            showInfo(s.mode, s.durationSec, s.distanceMeters, !!s.fallback);
        } catch(e) { alert('길찾기 실패: ' + (e?.message || e)); }
    };

    // 지우기
    el.querySelector('#poiClearRouteBtn').onclick = () => {
        clearRoute();
        infoEl.style.display = 'none';
        infoEl.textContent = '';
    };

    el.classList.remove('hide');
}

export function hidePoiCard(){ el?.classList.add('hide'); }
