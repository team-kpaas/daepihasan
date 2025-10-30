var swiper = new Swiper(".mySwiper", {

    slidesPerView: 3,
    loop:true,
    initialSlide:0,
    navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
    },
    observer: true,
    observeParents: true,
});
$(document).ready(function () {

    $("#map-move-button").on("click", function () {
        location.href = "/view/map";
    });

    $("#stat-move-button").on("click", function () {
        location.href = "/dashboard/forestFireCase";
    });

    $("#forecast-move-button").on("click", function () {
        location.href = "/fireForecast";
    });
    $("#board-move-button").on("click", function () {
        location.href = "/notice/list";
    });

})