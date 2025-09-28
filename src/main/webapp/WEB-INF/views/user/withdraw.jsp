<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>회원 탈퇴</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 480px; margin: 40px auto; }
        .box { border:1px solid #ccc; padding:18px; border-radius:8px; margin-bottom:18px; }
        button { padding:8px 14px; cursor:pointer; }
        input { width:100%; padding:8px; margin-top:6px; box-sizing:border-box; }
        .hidden { display:none; }
        .warn { color:#b30000; font-size:0.9em; }
    </style>
</head>
<body>
<%@ include file="../modal/modal.jsp" %>

<h2>회원 탈퇴</h2>

<div class="box" id="pwBox">
    <h3>1. 비밀번호 재확인</h3>
    <input type="password" id="currentPw" placeholder="현재 비밀번호">
    <button onclick="confirmPassword()">확인</button>
    <div id="pwMsg" class="warn"></div>
</div>

<div class="box hidden" id="mailBox">
    <h3>2. 탈퇴 확인 메일 발송</h3>
    <p>메일의 링크를 15분 이내 클릭하면 탈퇴가 완료됩니다.</p>
    <button onclick="sendWithdrawMail()">메일 발송</button>
    <div id="mailMsg" class="warn"></div>
</div>

<div class="box">
    <h3>유의 사항</h3>
    <ul>
        <li>탈퇴 시 복구가 불가능합니다.</li>
    </ul>
</div>

<script>
    function confirmPassword() {
        const pw = document.getElementById('currentPw').value.trim();
        if(!pw){ alert('비밀번호 입력'); return; }
        fetch('/user/withdraw/confirm-password',{
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:'password='+encodeURIComponent(pw)
        }).then(r=>r.json()).then(d=>{
            document.getElementById('pwMsg').textContent=d.msg;
            if(d.result===1){
                document.getElementById('mailBox').classList.remove('hidden');
            }
        });
    }
    function sendWithdrawMail(){
        fetch('/user/withdraw/request',{method:'POST'})
            .then(r=>r.json()).then(d=>{
            document.getElementById('mailMsg').textContent=d.msg;
            if(d.result===1){
                showModal('메일을 확인 후 링크를 클릭하세요.');
            } else if(d.result===8 || d.result===9){
                showModal(d.msg);
                location.reload();
            }
        });
    }
</script>
</body>
</html>
