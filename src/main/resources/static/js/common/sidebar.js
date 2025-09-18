// /js/map/sidebar.js
const SEL = '#sidebar, .sidebar';

export function toggleSidebar(force) {
    const sidebar = document.querySelector(SEL);
    const peekBtn = document.querySelector('.side-peek');
    if (!sidebar) return;

    const open = (typeof force === 'boolean')
        ? force
        : !sidebar.classList.contains('show');

    sidebar.classList.toggle('show', open);
    sidebar.style.transform = open ? 'translateX(0)' : 'translateX(-110%)';
    sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (peekBtn) {
        peekBtn.classList.toggle('open', open);
        peekBtn.style.transform = open ? 'translate(360px, -50%)' : 'translateY(-50%)';
    }

    console.log('[sidebar] toggled:', open);
}

// ★ 지도 클릭 억제 타이머
function suppressMapClick(ms = 350) {
    window.__suppressMapClickUntil = Date.now() + ms;
}

export function bindSidebar() {
    // click 대신 pointerdown 사용 + 즉시 억제
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('[data-action="toggle-sidebar"], .side-peek');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();
        suppressMapClick();        // 다음 짧은 시간 동안 지도 클릭 무시
        toggleSidebar();
    }, { passive: false });
}

// (구형 페이지 호환용)
if (typeof window !== 'undefined') window.toggleSidebar = toggleSidebar;
