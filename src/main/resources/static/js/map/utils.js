export const debounce = (fn, ms) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
export function showToast(msg){
    let t = document.getElementById('mapToast');
    if (!t) {
        t = document.createElement('div'); t.id = 'mapToast'; t.className = 'map-toast';
        t.style.cssText = 'position:fixed;right:12px;bottom:90px;background:rgba(0,0,0,.72);color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;z-index:2147483647;opacity:0;transform:translateY(6px);transition:opacity .18s,transform .18s';
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1'; t.style.transform = 'translateY(0)';
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(6px)'; }, 1200);
}
export function formatMeters(m){
    if (!Number.isFinite(m)) return '';
    if (m >= 1000) return (m >= 5000 ? Math.round(m/1000) : (m/1000).toFixed(1)) + 'km';
    return Math.round(m) + 'm';
}
export function formatDurationSec(s){
    if (!Number.isFinite(s)) return '';
    let m = Math.round(s/60);
    if (m < 1) m = 1;
    const h = Math.floor(m/60), mm = m%60;
    return h ? `약 ${h}시간${mm? ' '+mm+'분':''}` : `약 ${m}분`;
}