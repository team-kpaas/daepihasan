function getCurrentLatLng(callback) {
    navigator.geolocation.getCurrentPosition(function (pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("위치 측정 lat:", lat, ", lng:", lng)

        callback({lat, lng});
    }, function (error) {
        console.error("위치 정보를 가져올 수 없습니다.", error);
    });
}