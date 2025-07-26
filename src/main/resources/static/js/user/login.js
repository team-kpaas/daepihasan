// HTML로딩이 완료되고, 실행됨
$(document).ready(function () {

    // 회원가입
    $("#btnUserReg").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/userRegForm";
    })

    // 아이디 찾기
    $("#btnSearchUserId").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/searchUserId";
    })

    // 비밀번호 찾기
    $("#btnSearchPassword").on("click", function () { // 버튼 클릭했을때, 발생되는 이벤트 생성함(onclick 이벤트와 동일)
        location.href = "/user/searchPassword";
    })

    // 로그인
    $("#btnLogin").on("click", function () {
        let f = document.getElementById("f"); // form 태그

        if (f.userId.value === "") {
            alert("아이디를 입력하세요.");
            f.userId.focus();
            return;
        }

        if (f.password.value === "") {
            alert("비밀번호를 입력하세요.");
            f.password.focus();
            return;
        }

        // Ajax 호출해서 로그인하기
        $.ajax({
                url: "/user/loginProc",
                type: "post", // 전송방식은 Post
                dataType: "JSON", // 전송 결과는 JSON으로 받기
                data: $("#f").serialize(), // form 태그 내 input 등 객체를 자동으로 전송할 형태로 변경
                success: function (json) { // /user/loginProc 호출 성공시

                    if (json.result === 1) { // 로그인 성공
                        alert(json.msg); // 메시지 띄우기
                        location.href = "/user/loginResult"; // 로그인 성공 페이지 이동

                    } else { // 로그인 실패
                        alert(json.msg); // 메시지 띄우기
                        $("#userId").focus(); // 아이디 입력 항목에 마우스 커서 이동
                    }

                }
            }
        )

    })
})