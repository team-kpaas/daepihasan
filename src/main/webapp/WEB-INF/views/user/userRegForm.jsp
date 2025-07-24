<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>회원가입</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link href="/css/user/userRegForm.css" rel="stylesheet">
</head>
<body>

<div class="signup-container row g-0">
    <!-- 왼쪽 (회원가입 폼) -->
    <div class="signup-left col-lg-6 col-12 d-flex flex-column justify-content-center">
        <!-- 로고 -->
        <div class="text-center mb-4">
<%--            <img src="/images/logo-daepihasan.png" alt="대피하산 로고" style="height: 60px;">--%>
            <h1 class="fw-bold mb-4">대피하산</h1>
        </div>
        <h2 class="fw-bold mb-4">회원가입</h2>
        <form id="f">
            <div class="mb-3">
                <label class="form-label">아이디</label>
                <div class="input-group">
                    <input type="text" name="userId" class="form-control" placeholder="아이디">
                    <button id="btnUserId" type="button" class="btn btn-outline-secondary">중복체크</button>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">이름</label>
                <input type="text" name="userName" class="form-control" placeholder="이름">
            </div>
            <div class="mb-3">
                <label class="form-label">비밀번호</label>
                <input type="password" name="password" class="form-control" placeholder="비밀번호">
            </div>
            <div class="mb-3">
                <label class="form-label">비밀번호 확인</label>
                <input type="password" name="password2" class="form-control" placeholder="비밀번호 확인">
            </div>
            <div class="mb-3">
                <label class="form-label">이메일</label>
                <!-- 첫 줄: 이메일 입력 + 중복체크 버튼 -->
                <div class="input-group mb-2">
                    <input type="email" name="email" class="form-control" placeholder="이메일">
                    <button id="btnEmail" type="button" class="btn btn-outline-secondary">중복체크</button>
                </div>
                <!-- 둘째 줄: 인증번호 입력 -->
                <input type="text" name="authNumber" class="form-control" placeholder="인증번호">
            </div>
            <div class="mb-3">
                <label class="form-label">주소</label>
                <div class="input-group">
                    <input type="text" name="addr1" class="form-control" placeholder="주소">
                    <button id="btnAddr" type="button" class="btn btn-outline-secondary">우편번호</button>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">상세 주소</label>
                <input type="text" name="addr2" class="form-control" placeholder="상세주소">
            </div>
            <button id="btnSend" type="button" class="btn btn-primary w-100">회원가입</button>
        </form>
    </div>

    <!-- 오른쪽 (배너 이미지) -->
    <div class="signup-right col-lg-6 d-none d-lg-block">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령 배너">
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/user/userRegForm.js"></script>
</body>
</html>