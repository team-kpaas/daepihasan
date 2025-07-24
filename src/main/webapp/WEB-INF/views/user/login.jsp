<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대피하산 로그인</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/user/login.css" rel="stylesheet">
</head>
<body>
<div class="login-container row g-0">
    <!-- 왼쪽 (로그인) -->
    <div class="login-left col-lg-6 col-12 d-flex flex-column justify-content-center">
        <!-- 로고 -->
        <div class="text-center mb-4">
            <%--            <img src="/images/logo-daepihasan.png" alt="대피하산 로고" style="height: 60px;">--%>
            <h1 class="fw-bold mb-4">대피하산</h1>
        </div>
        <h2 class="mb-4 fw-bold">로그인</h2>
        <form>
            <div class="mb-3">
                <label for="username" class="form-label">아이디</label>
                <input type="text" class="form-control" id="username" placeholder="user123">
            </div>
            <div class="mb-4">
                <label for="password" class="form-label">비밀번호</label>
                <input type="password" class="form-control" id="password" placeholder="••••••">
            </div>
            <button type="submit" class="btn btn-primary w-100 mb-3">로그인</button>
            <div class="text-center">
                <a href="#">아이디/비밀번호 찾기</a> | <a href="#">회원가입</a>
            </div>
        </form>
    </div>

    <!-- 오른쪽 (이미지/배너) -->
    <div class="login-right col-lg-6 d-none d-lg-block">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령 배너">
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>