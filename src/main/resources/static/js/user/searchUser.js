$(document).ready(function () {
    // 메일 페이지 이동
    $(".logo").on("click", function () {
        location.href = "/";
    });

    // 탭 전환 + URL 동기화
    $("#tabId").on("click", function () {
        setActiveTab("id");
    });

    $("#tabPw").on("click", function () {
        setActiveTab("pw");
    });

    function setActiveTab(tab) {
        if (tab === "id") {
            $("#tabId").addClass("active");
            $("#tabPw").removeClass("active");
            $("#formId").removeClass("d-none");
            $("#formPw").addClass("d-none");
        } else {
            $("#tabPw").addClass("active");
            $("#tabId").removeClass("active");
            $("#formPw").removeClass("d-none");
            $("#formId").addClass("d-none");
        }
        // URL 갱신 (새로고침 시에도 유지)
        const newUrl = window.location.pathname + "?tab=" + tab;
        window.history.replaceState({}, "", newUrl);
    }

    // 이름: 2~15자, 한글만 (공백, 영어, 숫자 불가)
    const nameRegex = FormValidator.patterns.name;
    // 이메일: 표준 이메일 형식
    const emailRegex = FormValidator.patterns.email;
    // 아이디: 5~20자, 첫 글자는 소문자, 나머지 소문자/숫자/_/-
    const idRegex = FormValidator.patterns.id;

    // 로그인 이동
    $("#btnLogin1, #btnLogin2").on("click", function () {
        location.href = "/user/login";
    });

    // 아이디 찾기
    $("#btnSearchUserId").on("click", function () {
        FormValidator.clearErrors("#formId");
        const f = document.getElementById("formId");
        const userName = f.userName.value.trim();
        const email = f.email.value.trim();

        let valid = true;

        if (userName === "") {
            FormValidator.setError("#formId input[name='userName']", "#errorNameId", "이름을 입력하세요.");
            valid = false;
        } else if (!nameRegex.test(userName)) {
            FormValidator.setError("#formId input[name='userName']", "#errorNameId", "이름은 2~15자의 한글만 입력할 수 있습니다.");
            valid = false;
        }

        if (email === "") {
            FormValidator.setError("#formId input[name='email']", "#errorEmailId", "이메일을 입력하세요.");
            valid = false;
        } else if (!emailRegex.test(email)) {
            FormValidator.setError("#formId input[name='email']", "#errorEmailId", "올바른 이메일 형식을 입력하세요.");
            valid = false;
        }

        if (!valid) return;

        f.method = "post";
        f.action = "/user/searchUserIdProc";
        f.submit();
    });

    // 비밀번호 찾기
    $("#btnSearchPassword").on("click", function () {
        FormValidator.clearErrors("#formPw");
        const f = document.getElementById("formPw");
        const userId = f.userId.value.trim();
        const userName = f.userName.value.trim();
        const email = f.email.value.trim();

        let valid = true;

        if (userId === "") {
            FormValidator.setError("#formPw input[name='userId']", "#errorUserIdPw", "아이디를 입력하세요.");
            valid = false;
        } else if (!idRegex.test(userId)) {
            FormValidator.setError("#formPw input[name='userId']", "#errorUserIdPw", "아이디는 5~20자, 영문 소문자로 시작하며 소문자/숫자/_/-만 사용 가능합니다.");
            valid = false;
        }

        if (userName === "") {
            FormValidator.setError("#formPw input[name='userName']", "#errorNamePw", "이름을 입력하세요.");
            valid = false;
        } else if (!nameRegex.test(userName)) {
            FormValidator.setError("#formPw input[name='userName']", "#errorNamePw", "이름은 2~15자의 한글만 입력할 수 있습니다.");
            valid = false;
        }

        if (email === "") {
            FormValidator.setError("#formPw input[name='email']", "#errorEmailPw", "이메일을 입력하세요.");
            valid = false;
        } else if (!emailRegex.test(email)) {
            FormValidator.setError("#formPw input[name='email']", "#errorEmailPw", "올바른 이메일 형식을 입력하세요.");
            valid = false;
        }

        if (!valid) return;

        f.method = "post";
        f.action = "/user/searchPasswordProc";
        f.submit();
    });
});
