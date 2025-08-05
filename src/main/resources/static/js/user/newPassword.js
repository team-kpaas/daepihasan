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
        FormValidator.clearErrors("#formPw");

        const f = document.getElementById("formPw");
        const password = f.password.value.trim();
        const password2 = f.password2.value.trim();

        // 비밀번호 유효성 정규식 (8~20자, 소문자+숫자+특수문자(!@#$%^&*()) 필수)
        const pwRegex = FormValidator.patterns.password;

        let valid = true;

        // 새 비밀번호 검사
        if (password === "") {
            FormValidator.setError("#formPw input[name='password']", "#errorPassword", "새로운 비밀번호를 입력하세요.");
            valid = false;
        } else if (!pwRegex.test(password)) {
            FormValidator.setError("#formPw input[name='password']", "#errorPassword", "8~20자, 영문 소문자, 숫자, 특수문자(!@#$%^&*())를 사용하세요.");
            valid = false;
        }

        // 비밀번호 확인 검사
        if (password2 === "") {
            FormValidator.setError("#formPw input[name='password2']", "#errorPassword2", "비밀번호 확인을 입력하세요.");
            valid = false;
        } else if (password !== password2) {
            FormValidator.setError("#formPw input[name='password2']", "#errorPassword2", "입력한 두 비밀번호가 일치하지 않습니다.");
            valid = false;
        }

        if (!valid) return;

        // 서버 요청 (AJAX)
        $.ajax({
            type: "POST",
            url: "/user/newPasswordProc",
            data: { password: password, password2: password2 },
            success: function (json) {
                if (json.result === 1) {
                    alert(json.msg);
                    location.href = "/user/login";
                } else if (json.result === 0 || json.result == null) {
                    FormValidator.setError("#formPw input[name='password']", "#errorPassword", json.msg);
                } else if (json.result === 2) {
                    alert(json.msg);
                    location.href = "/user/login";
                }
            },
            error: function () {
                alert("서버와 통신 중 오류가 발생했습니다.");
            }
        });
    });
});