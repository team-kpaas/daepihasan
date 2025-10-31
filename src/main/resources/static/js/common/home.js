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

    $(document).on("click", "#map-move-button", function () {
        location.href = "/view/map";
    });

    $(document).on("click", "#stat-move-button", function () {
        location.href = "/dashboard/forestFireCase";
    });

    $(document).on("click", "#forecast-move-button", function () {
        location.href = "/forecast";
    });

});