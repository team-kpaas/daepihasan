// /js/map/ctx.js
let _ctx; // 캐시
export function getCtx() {
    if (typeof window !== 'undefined' && window.__CTX__) return window.__CTX__;
    const m = document.querySelector('meta[name="ctx"]');
    const v = (m && m.content) || '';
    if (!v) console.warn('[ctx] <meta name="ctx"> not found. API path may be wrong.');
    return v;
}

export function joinCtx(path = '') {
    const base = getCtx();
    return base ? (base + path) : path;
}

export const iconUrl = (rel = '') => {
    const ctx = getCtx();
    return ctx + (rel ? (rel.startsWith('/') ? rel : '/' + rel) : '/');
};
export function apiUrl(path = '') {
    // 필요하면 여기서 API prefix를 바꾸세요.
    return joinCtx(path);
}