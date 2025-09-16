// function getCurrentLatLng(callback) {
//     navigator.geolocation.getCurrentPosition(function (pos) {
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;
//         console.log("위치 측정 lat:", lat, ", lng:", lng)
//
//         callback({lat, lng});
//     }, function (error) {
//         console.error("위치 정보를 가져올 수 없습니다.", error);
//     });
// }
function getCurrentLatLng(callback) {
    if (!navigator.geolocation) {
        alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            console.log("위치 측정 lat:", lat, ", lng:", lng);
            callback({ lat, lng });
        },
        function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("위치 정보 권한이 거부되었습니다. 브라우저 설정을 확인하세요.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("위치 정보를 사용할 수 없습니다.");
                    break;
                case error.TIMEOUT:
                    alert("위치 정보를 가져오는 데 시간이 초과되었습니다.");
                    break;
                default:
                    alert("알 수 없는 오류가 발생했습니다.");
            }
            console.error("위치 정보를 가져올 수 없습니다.", error);
        }
    );
}