$(document).ready(function () {
    // 비밀번호 유효성 정규식 (8~20자, 소문자+숫자+특수문자(!@#$%^&*()) 필수)
    const pwRegex = FormValidator.patterns.password;
    const pwInput  = $("#formPw input[name='password']");
    const pw2Input = $("#formPw input[name='password2']");

    // 메시지 상수
    const MSG_RULE     = "8~20자, 영문 소문자, 숫자, 특수문자(!@#$%^&*())를 사용하세요.";
    const MSG_EMPTY_PW = "새로운 비밀번호를 입력하세요.";
    const MSG_EMPTY_PW2= "비밀번호 확인란을 입력하세요.";
    const MSG_MISMATCH = "입력한 두 비밀번호가 일치하지 않습니다.";

    // 로고 클릭 → 메인 이동
    $(".logo").on("click", function () {
        location.href = "/";
    });

    // 공통 검증 함수 (mode: 'input' | 'submit')
    function validate(mode) {
        const pw  = $.trim(pwInput.val());
        const pw2 = $.trim(pw2Input.val());
        var valid = true;
        var firstInvalid = null;

        // 1) 새 비밀번호
        if (!pw) {
            if (mode === "submit") {
                FormValidator.setError(pwInput, "#errorPassword", MSG_EMPTY_PW);
                if (!firstInvalid) firstInvalid = pwInput[0];
                valid = false;
            } else {
                pwInput.removeClass("is-valid is-invalid");
                $("#errorPassword").text("");
            }
        } else if (!pwRegex.test(pw)) {
            FormValidator.setError(pwInput, "#errorPassword", MSG_RULE);
            if (!firstInvalid) firstInvalid = pwInput[0];
            valid = false;
        } else {
            FormValidator.setSuccess(pwInput);
            $("#errorPassword").text("");
        }

        // 2) 비밀번호 확인
        if (!pw2) {
            if (mode === "submit") {
                FormValidator.setError(pw2Input, "#errorPassword2", MSG_EMPTY_PW2);
                if (!firstInvalid) firstInvalid = pw2Input[0];
                valid = false;
            } else {
                pw2Input.removeClass("is-valid is-invalid");
                $("#errorPassword2").text("");
            }
        } else if (pwRegex.test(pw) && pw === pw2) {
            FormValidator.setSuccess(pw2Input);
            $("#errorPassword2").text("");
        } else {
            FormValidator.setError(pw2Input, "#errorPassword2", MSG_MISMATCH);
            if (!firstInvalid) firstInvalid = pw2Input[0];
            valid = false;
        }

        return { valid: valid, firstInvalid: firstInvalid };
    }

    // 실시간 검증
    pwInput.on("input",  function () { validate("input"); });
    pw2Input.on("input", function () { validate("input"); });

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
        const password  = $.trim(pwInput.val());
        const password2 = $.trim(pw2Input.val());

        var result = validate("submit");
        if (!result.valid) {
            if (result.firstInvalid) result.firstInvalid.focus();
            return;
        }

        // 서버 요청 (AJAX)
        $.ajax({
            type: "POST",
            url: "/user/newPasswordProc",
            data: { password: password, password2: password2 },
            success: function (json) {
                if (json.result === 1) {
                    showModal(json.msg);
                    setTimeout(function () {
                        location.href = "/user/login";
                    }, 2000); // 2초 후 페이지 이동
                } else if (json.result === 0 || json.result == null) {
                    FormValidator.setError("#formPw input[name='password']", "#errorPassword", json.msg);
                } else if (json.result === 2) {
                    showModal(json.msg);
                    setTimeout(function () {
                        location.href = "/user/login";
                    }, 2000); // 2초 후 페이지 이동
                }
            },
            error: function () {
                showModal("서버와 통신 중 오류가 발생했습니다.");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // form 제출 방지

                const next = inputs[index + 1];
                if (next) {
                    next.focus(); // 다음 input으로 포커스 이동
                } else {
                    // 마지막 input일 경우: 예를 들어 버튼 클릭하거나 submit 실행
                    document.getElementById("btnChangePw")?.click();
                }
            }
        });
    });
});
