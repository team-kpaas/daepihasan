<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>탈퇴 결과</title>
    <style>
        body { font-family: Arial, sans-serif; max-width:480px; margin:60px auto; text-align:center; }
        .box { padding:28px; border:1px solid #ddd; border-radius:10px; }
        .ok { color:#0a7c29; }
        .warn { color:#b30000; }
        a { display:inline-block; margin-top:24px; text-decoration:none; padding:10px 18px; background:#333; color:#fff; border-radius:6px; }
    </style>
</head>
<body>
<div class="box">
    <h2>회원 탈퇴 결과</h2>
    <p class="${status eq 'success' ? 'ok' : 'warn'}">${msg}</p>
    <c:choose>
        <c:when test="${status eq 'success'}">
            <a href="/">메인으로</a>
        </c:when>
        <c:otherwise>
            <a href="/user/withdraw">다시 시도</a>
        </c:otherwise>
    </c:choose>
</div>
</body>
</html>
