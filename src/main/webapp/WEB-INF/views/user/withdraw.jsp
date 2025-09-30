<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>회원 탈퇴</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <style>
        body { background:#f3f6ff; color:black;}
        .wd-wrap { max-width:720px; margin:0 auto; padding:28px 18px 60px; }
        .wd-title { font-size:26px; font-weight:700; margin:0 0 22px; }
        .wd-card { background:#fff; border-radius:14px; padding:20px 22px; box-shadow:0 2px 12px rgba(0,0,0,.06); margin-bottom:20px; }
        .wd-card h3 { font-size:18px; font-weight:600; margin:0 0 14px; }
        .wd-card p { margin:0 0 10px; color:#555; }
        .wd-card ul { margin:0; padding-left:18px; }
        .wd-card li { margin:4px 0; }
        .wd-warn { color:#b30000; font-size:13px; margin-top:8px; min-height:18px; }
        .wd-actions button { margin-right:8px; }
        .hidden { display:none !important; }
        .wd-inline { display:flex; gap:10px; align-items:center; }
        .wd-inline input { flex:1; }
        @media (max-width:600px){
            .wd-wrap { padding:22px 14px 50px; }
            .wd-title { font-size:22px; }
        }
    </style>
</head>
<body>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/header.jsp" %>
<div class="app-body d-flex">
    <%@ include file="../common/sidebar.jsp" %>
    <main id="content" class="main-content flex-fill">
        <div class="wd-wrap">
            <h1 class="wd-title">회원 탈퇴</h1>

            <div class="wd-card" id="pwBox">
                <h3>1. 비밀번호 재확인</h3>
                <div class="wd-inline">
                    <input type="password" id="currentPw" class="form-control" placeholder="현재 비밀번호">
                    <button class="btn btn-primary" onclick="confirmPassword()">확인</button>
                </div>
                <div id="pwMsg" class="wd-warn"></div>
                <div class="text-muted" style="font-size:12px;">확인 완료 후 5분 이내 메일을 요청해야 합니다.</div>
            </div>

            <div class="wd-card hidden" id="mailBox">
                <h3>2. 탈퇴 확인 메일 발송</h3>
                <p>발송된 메일의 링크를 15분 이내 클릭하면 탈퇴가 완료됩니다.</p>
                <div class="wd-actions">
                    <button class="btn btn-danger" onclick="sendWithdrawMail()">탈퇴 메일 발송</button>
                </div>
                <div id="mailMsg" class="wd-warn"></div>
            </div>

            <div class="wd-card">
                <h3>유의 사항</h3>
                <ul>
                    <li>탈퇴 후 계정 및 데이터는 복구되지 않습니다.</li>
                    <li>이미 진행된 서비스 기록은 관련 법령에 따라 보관될 수 있습니다.</li>
                    <li>동일 아이디 재사용은 불가할 수 있습니다.</li>
                </ul>
            </div>
        </div>
        <%@ include file="../modal/modal.jsp" %>
    </main>
</div>

<script>
    function confirmPassword() {
        const pw = document.getElementById('currentPw').value.trim();
        if(!pw){
            document.getElementById('pwMsg').textContent='비밀번호를 입력하세요.';
            return;
        }
        fetch('/user/withdraw/confirm-password', {
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:'password='+encodeURIComponent(pw)
        }).then(r=>r.json()).then(d=>{
            document.getElementById('pwMsg').textContent=d.msg||'';
            if(d.result===1){
                document.getElementById('mailBox').classList.remove('hidden');
            } else {
                document.getElementById('mailBox').classList.add('hidden');
            }
        }).catch(()=>{ document.getElementById('pwMsg').textContent='처리 실패'; });
    }
    function sendWithdrawMail() {
        fetch('/user/withdraw/request', { method:'POST' })
            .then(r=>r.json()).then(d=>{
            document.getElementById('mailMsg').textContent=d.msg||'';
            if(d.result===1){
                if(typeof showModal==='function') showModal('메일을 확인 후 링크를 클릭하세요.');
            } else if(d.result===8 || d.result===9){
                if(typeof showModal==='function') showModal(d.msg);
                setTimeout(()=>location.reload(), 1500);
            }
        }).catch(()=>{ document.getElementById('mailMsg').textContent='처리 실패'; });
    }
</script>
<script src="/js/common/header.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
