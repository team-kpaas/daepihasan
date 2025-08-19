// MAP
function initTmap() {
    const el = document.getElementById('map_div');
    if (!el) return;

    if (!window.Tmapv3) {
        console.error('Tmap SDK 미로드: index.jsp head의 <script ...vectorjs> 확인');
        return;
    }

    // ★ 이 엘리먼트에 대해 한 번만 초기화 (조각이 새로 들어오면 dataset이 초기화됨)
    if (el.dataset.inited === '1') return;
    el.dataset.inited = '1';

    new Tmapv3.Map("map_div", {
        center: new Tmapv3.LatLng(37.56520450, 126.98702028),
        width: "100%",
        height: "100%", // #map_div에 높이 스타일을 둬
        zoom: 16
    });
}
