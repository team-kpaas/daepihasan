<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대피하산 로그인</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/common/style.css" rel="stylesheet" >
    <link href="/css/user/login.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
</head>
<body>
<%@ include file="../modal/modal.jsp" %>
<div class="full-container">
    <!-- 왼쪽 (로그인 폼) -->
    <div class="login-left">
        <!-- 로고 -->
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
            <span class="logo-text">대피하산</span>
        </div>

        <!-- 로그인 폼 -->
        <div class="form-container w-100">
            <h2 class="fw-bold mb-4 text-center">로그인</h2>
            <form id="f">
                <div class="mb-3">
                    <label for="userId" class="form-label">아이디</label>
                    <input type="text" class="form-control" id="userId" name="userId" placeholder="아이디를 입력하세요.">
                    <div class="invalid-feedback" id="errorUserId"></div>
                </div>
                <div class="mb-4">
                    <label for="password" class="form-label">비밀번호</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="비밀번호를 입력하세요.">
                    <div class="invalid-feedback" id="errorPassword"></div>
                </div>
                <button id="btnLogin" type="button" class="btn btn-primary w-100 mt-3 mb-3">로그인</button>
                <div class="text-center d-flex justify-content-center gap-2 links">
                    <button id="btnSearchUserId" type="button" class="btn text-secondary p-0">아이디 찾기</button>
                    <span class="text-secondary">|</span>
                    <button id="btnSearchPassword" type="button" class="btn text-secondary p-0">비밀번호 찾기</button>
                    <span class="text-secondary">|</span>
                    <button id="btnUserReg" type="button" class="btn text-secondary p-0">회원가입</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 오른쪽 (배너 이미지) -->
    <div class="login-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령 배너">
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/common/formValidator.js"></script>
<script src="/js/user/login.js"></script>
</body>
</html>