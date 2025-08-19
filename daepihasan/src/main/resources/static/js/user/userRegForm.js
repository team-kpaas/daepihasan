let userIdCheck = "Y";
let emailAuthNumber = "";




$(document).ready(function () {
    const f = document.getElementById("f");

    $("#btnUserId").on("click", function () { userIdExists(f); });
    $("#btnEmail").on("click", function () {
        buildEmail(); // 최신 이메일 반영
        emailExists(f);
    });
    $("#btnAddr").on("click", function () { kakaoPost(f); });
    $("#btnSend").on("click", function () { doSubmit(f); });

    // 이메일 구성 관련 입력 이벤트
    document.getElementById("emailId").addEventListener("input", buildEmail);
    document.getElementById("emailDomainInput").addEventListener("input", buildEmail);
    document.getElementById("emailDomainSelect").addEventListener("change", function () {
        const selected = this.value;
        const emailInput = document.getElementById("emailDomainInput");

        if (selected === "") {
            emailInput.style.display = "inline-block";
            emailInput.value = "";
            emailInput.focus();
        } else if (selected === "etc") {
            document.getElementById("emailDomainSelect").style.display = "none";
            document.getElementById("emailDomainInput").style.display = "inline-block";
            document.getElementById("emailDomainInput").focus();
        } else {
            emailInput.style.display = "none";
            emailInput.value = "";
        }

        buildEmail(); // 항상 최신 이메일 문자열 반영
    });
});

function buildEmail() {
    const id = document.getElementById("emailId").value.trim();
    const domainInput = document.getElementById("emailDomainInput").value.trim();
    const emailHidden = document.getElementById("email");
    const emailRuleDiv = document.getElementById("emailRule");

    let domain;
    if (document.getElementById("emailDomainSelect").style.display === "none") {
        domain = domainInput;
    } else {
        domain = document.getElementById("emailDomainSelect").value;
    }

    const fullEmail = (id && domain) ? `${id}@${domain}` : "";
    emailHidden.value = fullEmail;

    if (fullEmail === "") {
        emailRuleDiv.textContent = "";
        return;
    }

    const emailRegex = /^[0-9a-zA-Z]([\-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([\-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    if (emailRegex.test(fullEmail)) {
        emailRuleDiv.style.color = "green";
        emailRuleDiv.textContent = "올바른 이메일 형식입니다.";
    } else {
        emailRuleDiv.style.color = "red";
        emailRuleDiv.textContent = "※ 올바른 이메일 주소 형식으로 입력하세요.";
    }
}

function userIdExists(f) {
    if (f.userId.value === "") {
        showModal("아이디를 입력하세요."); f.userId.focus(); return;
    }
    $.post("/user/getUserIdExists", $("#f").serialize(), function (json) {
        if (json.existsYn === "Y") {
            showModal("이미 가입된 아이디가 존재합니다."); f.userId.focus();
        } else {
            showModal("가입 가능한 아이디입니다."); userIdCheck = "N";
        }
    }, "json");
}

function emailExists(f) {
    if (f.email.value === "") {
        showModal("이메일을 입력하세요."); return;
    }
    $.post("/user/getEmailExists", $("#f").serialize(), function (json) {
        if (json.existsYn === "Y") {
            showModal("이미 가입된 이메일 주소가 존재합니다.");
        } else {
            showModal("이메일로 인증번호가 발송되었습니다.");
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
    if (f.userId.value === "") { showModal("아이디를 입력하세요."); f.userId.focus(); return; }
    if (f.userName.value === "") { showModal("이름을 입력하세요."); f.userName.focus(); return; }
    if (userIdCheck !== "N") { showModal("아이디 중복체크를 해주세요."); return; }
    if (f.password.value === "" || f.password2.value === "") { showModal("비밀번호를 입력하세요."); return; }
    if (f.password.value !== f.password2.value) { showModal("비밀번호가 일치하지 않습니다."); return; }
    if (f.email.value === "") { showModal("이메일을 입력하세요."); return; }
    if (f.authNumber.value === "" || f.authNumber.value != emailAuthNumber) {
        showModal("이메일 인증번호가 올바르지 않습니다."); return;
    }
    if (f.addr1.value === "") {
        showModal("주소를 입력하세요."); return;
    }

    const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;
    if (!pwRegex.test(f.password.value)) {
        showModal("비밀번호가 조건을 충족하지 않습니다.");
        f.password.focus();
        return;
    }

    $.post("/user/insertUserInfo", $("#f").serialize(), function (json) {
        showModal(json.msg);
        if (json.result === 1) location.href = "/user/login";
    }, "json");
}

// 비밀번호 유효성 검사
const password = document.getElementById("password");
const pwRuleDiv = document.getElementById("pwRule");
const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

password.addEventListener("input", function () {
    const pw = this.value;

    if (pw === "") {
        pwRuleDiv.textContent = "";
        return;
    }

    if (pwRegex.test(pw)) {
        pwRuleDiv.style.color = "green";
        pwRuleDiv.textContent = "사용 가능한 비밀번호입니다.";
    } else {
        pwRuleDiv.style.color = "red";
        pwRuleDiv.textContent = "※ 8~20자 / 소문자 + 숫자 + 특수문자 필수";
    }
});

// 비밀번호 일치 여부 검사
const password2 = document.getElementById("password2");
const pwMatchDiv = document.getElementById("pwMatch");

function checkPasswordMatch() {
    const pw1 = password.value;
    const pw2 = password2.value;

    if (pw2 === "") {
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

password.addEventListener("input", checkPasswordMatch);
password2.addEventListener("input", checkPasswordMatch);

// 아이디 유효성 검사
const userIdInput = document.querySelector("input[name='userId']");
const idRuleDiv = document.getElementById("idRule");
const idRegex = /^[a-z][a-z0-9]{3,19}$/;

userIdInput.addEventListener("input", function () {
    const id = this.value;

    if (id === "") {
        idRuleDiv.textContent = "";
        return;
    }

    if (idRegex.test(id)) {
        idRuleDiv.style.color = "green";
        idRuleDiv.textContent = "사용 가능한 아이디 형식입니다.";
    } else {
        idRuleDiv.style.color = "red";
        idRuleDiv.textContent = "※ 4~20자 / 소문자로 시작 + 숫자 가능";
    }

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
                    document.getElementById("btnSend")?.click();
                }
            }
        });
    });
});