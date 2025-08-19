function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

// 사이드바 외부 클릭 시 닫기
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');

    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickToggleBtn = toggleBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickToggleBtn && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
});

// 화면 크기 조절 시 사이드바 닫기
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
});
