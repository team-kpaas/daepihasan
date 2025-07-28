$(document).ready(function () {
    // 탭 전환
    $("#tabId").on("click", function () {
        location.href = "/user/searchUser?tab=id";
    });
    $("#tabPw").on("click", function () {
        location.href = "/user/searchUser?tab=pw";
    });

    // 로그인 버튼
    $("#btnLogin").on("click", function () {
        location.href = "/user/login";
    });
});
