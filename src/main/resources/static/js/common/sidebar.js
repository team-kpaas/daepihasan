// 기존 toggleSidebar, 외부클릭 닫기, resize 코드는 그대로 두고 아래만 추가

// 하위 메뉴 토글 로직 (모바일/터치 우선)
document.querySelectorAll('.submenu-toggle').forEach(function (anchor) {
    let tappedOnce = false;
    anchor.addEventListener('click', function (e) {
        const li = anchor.closest('.has-submenu');
        const isOpen = li.classList.contains('open');
        const sidebar = document.getElementById('sidebar');

        // 모바일 너비이거나 터치 디바이스에서: 첫 클릭은 펼치기만
        const isNarrow = window.innerWidth <= 1370;
        const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

        if ((isNarrow || isTouch) && !isOpen) {
            e.preventDefault();                 // 바로 이동 막음
            // 다른 열림 닫기(옵션): 사이드바 내 다른 open 제거
            sidebar.querySelectorAll('.has-submenu.open').forEach(n => {
                if (n !== li) n.classList.remove('open');
            });
            li.classList.add('open');
            anchor.setAttribute('aria-expanded', 'true');
            tappedOnce = true;
            return;
        }

        // 이미 열려있고 다시 클릭하면 원래 링크로 이동(기본 동작)
        anchor.setAttribute('aria-expanded', String(!isOpen));
        li.classList.toggle('open');
        // 열려 있는데 다시 클릭 시 이동을 원하면 preventDefault 하지 않음
        // 닫히기만 원하면 e.preventDefault() 추가
    });

    // 키보드 접근: Enter/Space로 펼침
    anchor.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const li = anchor.closest('.has-submenu');
            const isOpen = li.classList.contains('open');
            li.classList.toggle('open');
            anchor.setAttribute('aria-expanded', String(!isOpen));
        }
    });
});

// 사이드바 외부 클릭 시 열려있는 서브메뉴 닫기 (기존 외부 닫기 로직 보완)
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickToggleBtn = toggleBtn && toggleBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickToggleBtn && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }

    // 서브메뉴도 닫기
    if (!isClickInsideSidebar) {
        sidebar.querySelectorAll('.has-submenu.open').forEach(n => n.classList.remove('open'));
        sidebar.querySelectorAll('.submenu-toggle[aria-expanded="true"]').forEach(a => a.setAttribute('aria-expanded', 'false'));
    }
});

// 화면 크기 조절 시 사이드바와 서브메뉴 상태 정리 (기존 코드 + 보완)
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
    // 데스크톱 전환 시 서브메뉴 열림 상태는 유지해도 무방하지만, 깔끔히 닫고 싶다면 아래 주석 해제
    // sidebar.querySelectorAll('.has-submenu.open').forEach(n => n.classList.remove('open'));
});
