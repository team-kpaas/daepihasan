let userIdCheck = "Y";
let emailAuthNumber = "";

$(document).ready(function () {
    const f = document.getElementById("f");

    $("#btnUserId").on("click", function () { userIdExists(f); });
    $("#btnEmail").on("click", function () { emailExists(f); });
    $("#btnAddr").on("click", function () { kakaoPost(f); });
    $("#btnSend").on("click", function () { doSubmit(f); });
});

function userIdExists(f) {
    if (f.userId.value === "") {
        alert("아이디를 입력하세요."); f.userId.focus(); return;
    }
    $.post("/user/getUserIdExists", $("#f").serialize(), function (json) {
        if (json.existsYn === "Y") {
            alert("이미 가입된 아이디가 존재합니다."); f.userId.focus();
        } else {
            alert("가입 가능한 아이디입니다."); userIdCheck = "N";
        }
    }, "json");
}

function emailExists(f) {
    if (f.email.value === "") {
        alert("이메일을 입력하세요."); f.email.focus(); return;
    }
    $.post("/user/getEmailExists", $("#f").serialize(), function (json) {
        if (json.existsYn === "Y") {
            alert("이미 가입된 이메일 주소가 존재합니다."); f.email.focus();
        } else {
            alert("이메일로 인증번호가 발송되었습니다.");
            emailAuthNumber = json.authNumber;
        }
    }, "json");
}

function kakaoPost(f) {
    new daum.Postcode({
        oncomplete: function (data) {
            f.addr1.value = "(" + data.zonecode + ")" + data.address;
        }
    }).open();
}

function doSubmit(f) {
    if (f.userId.value === "") { alert("아이디를 입력하세요."); f.userId.focus(); return; }
    if (userIdCheck !== "N") { alert("아이디 중복체크를 해주세요."); return; }
    // if (f.userName.value === "") { alert("이름을 입력하세요."); f.userName.focus(); return; }
    // 입력폼에 이름이 없기 떄문에 주석처리
    if (f.password.value === "" || f.password2.value === "") { alert("비밀번호를 입력하세요."); return; }
    if (f.password.value !== f.password2.value) { alert("비밀번호가 일치하지 않습니다."); return; }
    if (f.email.value === "") { alert("이메일을 입력하세요."); return; }
    if (f.authNumber.value === "" || f.authNumber.value != emailAuthNumber) {
        alert("이메일 인증번호가 올바르지 않습니다."); return;
    }
    if (f.addr1.value === "" || f.addr2.value === "") {
        alert("주소를 입력하세요."); return;
    }

    const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;
    if (!pwRegex.test(f.password.value)) {
        alert("비밀번호가 조건을 충족하지 않습니다.");
        f.password.focus();
        return;
    }

    $.post("/user/insertUserInfo", $("#f").serialize(), function (json) {
        alert(json.msg);
        if (json.result === 1) location.href = "/user/login";
    }, "json");


}

document.getElementById("password").addEventListener("input", function () {
    const pw = this.value;
    const pwRuleDiv = document.getElementById("pwRule");

    const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

    if (pwRegex.test(pw)) {
        pwRuleDiv.style.color = "green";
        pwRuleDiv.textContent = "사용 가능한 비밀번호입니다.";
    } else {
        pwRuleDiv.style.color = "red";
        pwRuleDiv.textContent = "※ 8~20자 / 소문자 + 숫자 + 특수문자 필수";
    }
});

document.getElementById("password").addEventListener("input", checkPasswordMatch);
document.getElementById("password2").addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
    const pw1 = document.getElementById("password").value;
    const pw2 = document.getElementById("password2").value;
    const pwMatchDiv = document.getElementById("pwMatch");

    if (pw2.length === 0) {
        pwMatchDiv.textContent = "";
        return;
    }

    if (pw1 === pw2) {
        pwMatchDiv.style.color = "green";
        pwMatchDiv.textContent = "비밀번호가 일치합니다.";
    } else {
        pwMatchDiv.style.color = "red";
        pwMatchDiv.textContent = "비밀번호가 일치하지 않습니다.";
    }
}
