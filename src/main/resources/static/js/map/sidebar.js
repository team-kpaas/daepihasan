// /js/map/sidebar.js
const SEL = '#sidebar, .sidebar';

export function toggleSidebar(force) {
    const bars = [...document.querySelectorAll(SEL)];
    const peek = document.querySelector('.side-peek');

    if (!bars.length) { console.warn('[sidebar] not found'); return; }

    // 상태 계산: force가 boolean이면 그 값, 아니면 반전
    const open = (typeof force === 'boolean')
        ? force
        : !bars[0].classList.contains('show');

    bars.forEach(el => {
        el.classList.toggle('show', open);
        el.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    if (peek) peek.classList.toggle('open', open);

    console.log('[sidebar] toggled:', open);
}

export function bindSidebar() {
    const triggers = [
        document.getElementById('btnSidebarInSearch'),
        document.querySelector('.side-peek'),
        ...document.querySelectorAll('[data-action="toggle-sidebar"]')
    ].filter(Boolean);

    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); });
    });
}

// JSP 인라인 onclick 대응
if (typeof window !== 'undefined') {
    window.toggleSidebar = toggleSidebar;
}
