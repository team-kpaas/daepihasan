// HTML로딩이 완료되고, 실행됨
$(document).ready(function () {

    // 정규식
    const idRegex = FormValidator.patterns.id;
    const pwRegex = FormValidator.patterns.password;

    // 로고 클릭 → 메인 이동
    $(".logo").on("click", function () {
        location.href = "/";
    });

    // 회원가입
    $("#btnUserReg").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/userRegForm";
    })

    // 아이디 찾기
    $("#btnSearchUserId").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/searchUser?tab=id";
    })

    // 비밀번호 찾기
    $("#btnSearchPassword").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/searchUser?tab=pw";
    })

    // 제출 전 최종 검증
    function validateBeforeSubmit() {
        const $id = $("#userId");
        const $pw = $("#password");
        const idVal = $id.val().trim();
        const pwVal = $pw.val().trim();

        // 이전 에러 초기화
        FormValidator.clearErrors("#f");

        let hasEmpty = false;

        // 1) 공백 체크 → div에 메시지
        if (!idVal) {
            FormValidator.setError($id, "#errorUserId", "아이디를 입력하세요.");
            if (!hasEmpty) $id.focus();
            hasEmpty = true;
        }
        if (!pwVal) {
            FormValidator.setError($pw, "#errorPassword", "비밀번호를 입력하세요.");
            if (!hasEmpty) $pw.focus();
            hasEmpty = true;
        }
        if (hasEmpty) return false;

        // 2) 형식 체크 → alert 한 번만
        const idOk = idRegex.test(idVal);
        const pwOk = pwRegex.test(pwVal);

        if (!idOk || !pwOk) {
            showModal("아이디 및 비밀번호 형식이 올바르지 않습니다.");
            // 포커스는 먼저 틀린 필드로
            if (!idOk) {
                $id.focus();
            } else {
                $pw.focus();
            }
            return false;
        }

        // 모두 정상
        return true;
    }

    // 로그인
    $("#btnLogin").on("click", function () {
        if (!validateBeforeSubmit()) return;

        // Ajax 호출해서 로그인하기
        $.ajax({
                url: "/user/loginProc",
                type: "post", // 전송방식은 Post
                dataType: "JSON", // 전송 결과는 JSON으로 받기
                data: $("#f").serialize(), // form 태그 내 input 등 객체를 자동으로 전송할 형태로 변경
                success: function (json) { // /user/loginProc 호출 성공시

                    if (json.result === 1) { // 로그인 성공
                        showModal(json.msg); // 메시지 띄우기
                        setTimeout(function () {
                            location.href = "/";
                        }, 2000); // 2초 후 페이지 이동

                    } else { // 로그인 실패
                        showModal(json.msg); // 메시지 띄우기
                        $("#userId").focus(); // 아이디 입력 항목에 마우스 커서 이동
                    }

                }
            }
        )

    })
})

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
                    document.getElementById("btnSend")?.click();
                }
            }
        });
    });
});