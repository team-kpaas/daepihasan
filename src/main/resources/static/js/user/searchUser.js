$(document).ready(function () {
    // 로고 클릭 → 메인 이동
    $(".logo").on("click", function () {
        location.href = "/";
    });

    // 정규식 (FormValidator 공통 사용)
    const nameRegex  = FormValidator.patterns.name;
    const emailRegex = FormValidator.patterns.email;
    const idRegex    = FormValidator.patterns.id;

    // 공통: 폼 초기화
    function resetForm(formSelector) {
        const $form = $(formSelector);
        if (!$form.length) return;

        // 첫 번째 form의 reset() 실행
        $form[0].reset();

        // 값/상태/메시지 강제 초기화
        $form.find(".is-valid, .is-invalid").removeClass("is-valid is-invalid");
        $form.find(".invalid-feedback").text("");
    }

    // 탭 전환 + URL 동기화
    $("#tabId").on("click", function () { setActiveTab("id"); });
    $("#tabPw").on("click", function () { setActiveTab("pw"); });

    function setActiveTab(tab) {
        // 탭 바꾸기 전에 폼 모두 초기화
        resetForm("#formId");
        resetForm("#formPw");

        if (tab === "id") {
            $("#tabId").addClass("active");
            $("#tabPw").removeClass("active");
            $("#formId").removeClass("d-none");
            $("#formPw").addClass("d-none");
            FormValidator.clearErrors("#formPw");
            $("#formId input:visible:first").trigger("focus");
        } else {
            $("#tabPw").addClass("active");
            $("#tabId").removeClass("active");
            $("#formPw").removeClass("d-none");
            $("#formId").addClass("d-none");
            FormValidator.clearErrors("#formId");
            $("#formPw input:visible:first").trigger("focus");
        }
        const newUrl = window.location.pathname + "?tab=" + tab;
        window.history.replaceState({}, "", newUrl);
    }

    // 로그인 이동
    $("#btnLogin1, #btnLogin2").on("click", function () {
        location.href = "/user/login";
    });

    // 공통 실시간 검증 바인딩 함수
    function bindLiveValidation({ formSelector, inputSelector, errorSelector, rule, emptyMsg = "" , invalidMsg }) {
        const $input = $(`${formSelector} ${inputSelector}`);
        const $error = $(errorSelector);

        $input.on("input", function () {
            const val = $(this).val().trim();

            if (!val) {
                $(this).removeClass("is-valid is-invalid");
                $error.text(emptyMsg);
                return;
            }
            if (rule.test(val)) {
                FormValidator.setSuccess(this);
                $error.text("");
            } else {
                FormValidator.setError(this, errorSelector, invalidMsg);
            }
        });
    }

    // 아이디 찾기 폼 실시간 검증
    bindLiveValidation({
        formSelector: "#formId",
        inputSelector: "input[name='userName']",
        errorSelector: "#errorNameId",
        rule: nameRegex,
        emptyMsg: "",
        invalidMsg: "이름은 2~15자의 한글만 입력할 수 있습니다."
    });
    bindLiveValidation({
        formSelector: "#formId",
        inputSelector: "input[name='email']",
        errorSelector: "#errorEmailId",
        rule: emailRegex,
        emptyMsg: "",
        invalidMsg: "올바른 이메일 형식을 입력하세요."
    });

    // 비밀번호 찾기 폼 실시간 검증
    bindLiveValidation({
        formSelector: "#formPw",
        inputSelector: "input[name='userId']",
        errorSelector: "#errorUserIdPw",
        rule: idRegex,
        emptyMsg: "",
        invalidMsg: "아이디는 5~20자, 영문 소문자로 시작하며 소문자/숫자/_/-만 사용 가능합니다."
    });
    bindLiveValidation({
        formSelector: "#formPw",
        inputSelector: "input[name='userName']",
        errorSelector: "#errorNamePw",
        rule: nameRegex,
        emptyMsg: "",
        invalidMsg: "이름은 2~15자의 한글만 입력할 수 있습니다."
    });
    bindLiveValidation({
        formSelector: "#formPw",
        inputSelector: "input[name='email']",
        errorSelector: "#errorEmailPw",
        rule: emailRegex,
        emptyMsg: "",
        invalidMsg: "올바른 이메일 형식을 입력하세요."
    });

    // 버튼 클릭 시 최종 검증 + 값 전송
    $("#btnSearchUserId").on("click", function () {
        FormValidator.clearErrors("#formId");
        const f = document.getElementById("formId");
        const userName = f.userName.value.trim();
        const email = f.email.value.trim();
        let valid = true;
        let firstInvalid = null;

        if (!userName) {
            FormValidator.setError("#formId input[name='userName']", "#errorNameId", "이름을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.userName;
            valid = false;
        } else if (!nameRegex.test(userName)) {
            FormValidator.setError("#formId input[name='userName']", "#errorNameId", "이름은 2~15자의 한글만 입력할 수 있습니다.");
            if (!firstInvalid) firstInvalid = f.userName;
            valid = false;
        }

        if (!email) {
            FormValidator.setError("#formId input[name='email']", "#errorEmailId", "이메일을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.email;
            valid = false;
        } else if (!emailRegex.test(email)) {
            FormValidator.setError("#formId input[name='email']", "#errorEmailId", "올바른 이메일 형식을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.email;
            valid = false;
        }

        if (!valid) {
            firstInvalid.focus();
            return;
        }

        f.method = "post";
        f.action = "/user/searchUserIdProc";
        f.submit();
    });

    $("#btnSearchPassword").on("click", function () {
        FormValidator.clearErrors("#formPw");
        const f = document.getElementById("formPw");
        const userId   = f.userId.value.trim();
        const userName = f.userName.value.trim();
        const email    = f.email.value.trim();
        let valid = true;
        let firstInvalid = null;

        if (!userId) {
            FormValidator.setError("#formPw input[name='userId']", "#errorUserIdPw", "아이디를 입력하세요.");
            if (!firstInvalid) firstInvalid = f.userId;
            valid = false;
        } else if (!idRegex.test(userId)) {
            FormValidator.setError("#formPw input[name='userId']", "#errorUserIdPw", "아이디는 5~20자, 영문 소문자로 시작하며 소문자/숫자/_/-만 사용 가능합니다.");
            if (!firstInvalid) firstInvalid = f.userId;
            valid = false;
        }

        if (!userName) {
            FormValidator.setError("#formPw input[name='userName']", "#errorNamePw", "이름을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.userName;
            valid = false;
        } else if (!nameRegex.test(userName)) {
            FormValidator.setError("#formPw input[name='userName']", "#errorNamePw", "이름은 2~15자의 한글만 입력할 수 있습니다.");
            if (!firstInvalid) firstInvalid = f.userName;
            valid = false;
        }

        if (!email) {
            FormValidator.setError("#formPw input[name='email']", "#errorEmailPw", "이메일을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.email;
            valid = false;
        } else if (!emailRegex.test(email)) {
            FormValidator.setError("#formPw input[name='email']", "#errorEmailPw", "올바른 이메일 형식을 입력하세요.");
            if (!firstInvalid) firstInvalid = f.email;
            valid = false;
        }

        if (!valid) {
            firstInvalid.focus();
            return;
        }

        f.method = "post";
        f.action = "/user/searchPasswordProc";
        f.submit();
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
                    document.getElementById("btnSearchPassword")?.click();
                }
            }
        });
    });
});
