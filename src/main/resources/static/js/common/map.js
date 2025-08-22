    // /js/common/map.js

    function initTmap() {
        // SDK 네임스페이스: vectorjs v1은 보통 Tmapv3
        const map = new Tmapv3.Map("map_div", {
            center: new Tmapv3.LatLng(37.56520450, 126.98702028),
            zoom: 16,
            width:"100%",
            height:"880px",
            zoomControl: true
            // width/height는 CSS로 이미 지정했으니 옵션에서 굳이 주지 않아도 됨
        });

        // 창 크기 변경 시 지도 리사이즈
        window.addEventListener('resize', () => map.resize());
    }

    // SDK가 로드됐는지 확인 후 호출
    (function boot(retry = 20) {
        if (window.Tmapv3 && document.getElementById('map_div')) {
            initTmap();
        } else if (retry > 0) {
            setTimeout(() => boot(retry - 1), 150);
        } else {
            console.warn('Tmap SDK 로드 확인 실패');
        }
    })();