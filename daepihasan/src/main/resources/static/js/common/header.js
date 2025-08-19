$(document).ready(function () {
    // 로고 클릭 → 메인 이동
    $(".logo").on("click", function () {
        location.href = "/";
    });

    // 로그인으로 이동
    $("#btnLogin").on("click", function () {
        location.href = "/user/login";
    });

    // 회원가입으로 이동
    $("#btnUserReg").on("click", function () {
        location.href = "/user/userRegForm";
    });

    // 마이페이지
    $("#btnMyPage").on("click", function () {
        alert("미이페이지");
    });

    // 로그아웃
    $("#btnLogout").on("click", function () {
        location.href = "/user/logout";
    });
})