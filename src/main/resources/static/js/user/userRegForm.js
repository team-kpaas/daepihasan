let userIdCheck = "Y";
let emailAuthNumber = "";

$(document).ready(function () {
    const f = document.getElementById("f");

    $("#btnUserId").on("click", function () { userIdExists(f) });
    $("#btnEmail").on("click", function () { emailExists(f) });
    $("#btnAddr").on("click", function () { kakaoPost(f) });
    $("#btnSend").on("click", function () { doSubmit(f) });
});

function userIdExists(f) {
    if (f.userId.value === "") { alert("아이디를 입력하세요."); f.userId.focus(); return; }
    $.post("/user/getUserIdExists", $("#f").serialize(), function (json) {
    if (json.existsYn === "Y") { alert("이미 가입된 아이디가 존재합니다."); f.userId.focus(); }
    else { alert("가입 가능한 아이디입니다."); userIdCheck = "N"; }
}, "json");
}

function emailExists(f) {
    if (f.email.value === "") { alert("이메일을 입력하세요."); f.email.focus(); return; }
    $.post("/user/getEmailExists", $("#f").serialize(), function (json) {
    if (json.existsYn === "Y") { alert("이미 가입된 이메일 주소가 존재합니다."); f.email.focus(); }
    else { alert("이메일로 인증번호가 발송되었습니다."); emailAuthNumber = json.authNumber; }
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
    if (f.userName.value === "") { alert("이름을 입력하세요."); f.userName.focus(); return; }
    if (f.password.value === "" || f.password2.value === "") { alert("비밀번호를 입력하세요."); return; }
    if (f.password.value !== f.password2.value) { alert("비밀번호가 일치하지 않습니다."); return; }
    if (f.email.value === "") { alert("이메일을 입력하세요."); return; }
    if (f.authNumber.value === "" || f.authNumber.value != emailAuthNumber) {
    alert("이메일 인증번호가 올바르지 않습니다."); return;
}

if (f.addr1.value === "" || f.addr2.value === "") {
    alert("주소를 입력하세요."); return;
}

$.post("/user/insertUserInfo", $("#f").serialize(), function (json) {
    alert(json.msg);
    if (json.result === 1) location.href = "/user/login";
    }, "json");
}