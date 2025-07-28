$(document).ready(function () {
    // 탭 클릭 시 searchUser로 이동
    $("#tabId").on("click", function () {
        location.href = "/user/searchUser?tab=id";
    });
    $("#tabPw").on("click", function () {
        location.href = "/user/searchUser?tab=pw";
    });

    // 로그인으로 이동
    $("#btnLogin").on("click", function () {
        location.href = "/user/login";
    });

    // 비밀번호 재설정 처리
    $("#btnChangePw").on("click", function () {
        $("#errorMsg").hide().text("");  // 에러 메시지 초기화

        const f = document.getElementById("formPw");
        const password = f.password.value;
        const password2 = f.password2.value;


        if (password === "") {
            alert("새로운 비밀번호를 입력하세요.");
            f.password.focus();
            return;
        }
        if (password2 === "") {
            alert("비밀번호 확인을 입력하세요.");
            f.password2.focus();
            return;
        }

        if (f.password.value !== f.password2.value) {
            // 불일치 시 화면 아래 표시 (빨간글씨)
            $("#errorMsg").text("입력한 두 비밀번호가 일치하지 않습니다.").show();
            f.password.focus();
            return;
        }

        $.ajax({
            type: "POST",
            url: "/user/newPasswordProc",
            data: { password: password, password2: password2 },
            success: function (json) {
                if (json.result === 1) {
                    alert(json.msg);
                    location.href = "/user/login";  // 성공 → 로그인으로
                } else if (json.result === 0 || json.result == null) {
                    // 불일치 시 화면 아래 표시 (빨간글씨)
                    $("#errorMsg").text(json.msg).show();
                } else if (json.result === 2) {
                    alert(json.msg);
                    location.href = "/user/login";  // 비정상 접근도 로그인으로
                }
            },
            error: function () {
                alert("서버와 통신 중 오류가 발생했습니다.");
            }
        });
    });
});
