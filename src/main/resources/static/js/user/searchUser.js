$(document).ready(function () {
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

    // // JSP에서 전달된 기본 탭 활성화
    // const defaultTab = $("#defaultTab").val() || "id";
    // setActiveTab(defaultTab);

    // 로그인 이동
    $("#btnLogin1, #btnLogin2").on("click", function () {
        location.href = "/user/login";
    });

    // 아이디 찾기
    $("#btnSearchUserId").on("click", function () {
        const f = document.getElementById("formId");
        if (f.userName.value === "") { alert("이름을 입력하세요."); f.userName.focus(); return; }
        if (f.email.value === "") { alert("이메일을 입력하세요."); f.email.focus(); return; }

        f.method = "post";
        f.action = "/user/searchUserIdProc";
        f.submit();
    });

    // 비밀번호 찾기
    $("#btnSearchPassword").on("click", function () {
        const f = document.getElementById("formPw");
        if (f.userId.value === "") { alert("아이디를 입력하세요."); f.userId.focus(); return; }
        if (f.userName.value === "") { alert("이름을 입력하세요."); f.userName.focus(); return; }
        if (f.email.value === "") { alert("이메일을 입력하세요."); f.email.focus(); return; }

        f.method = "post";
        f.action = "/user/searchPasswordProc";
        f.submit();
    });
});
