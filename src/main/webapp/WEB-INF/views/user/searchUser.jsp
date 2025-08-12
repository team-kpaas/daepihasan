<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>아이디/비밀번호 찾기</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/user/searchUser.css" rel="stylesheet">
    <style>
        body {
            font-family: 'NanumSquare', sans-serif;
        }
    </style>
    <script src="/js/jquery-3.7.1.min.js"></script>
</head>
<body>
<div class="full-container">
    <!-- 왼쪽 (폼 영역) -->
    <div class="search-left">
        <!-- 로고 -->
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
            <span class="logo-text">대피하산</span>
        </div>

        <!-- 상단 탭 -->
        <div class="tab-container d-flex justify-content-center mb-4">
            <button id="tabId" class="tab-btn ${activeTab eq 'id' ? 'active' : ''}">아이디 찾기</button>
            <button id="tabPw" class="tab-btn ${activeTab eq 'pw' ? 'active' : ''}">비밀번호 찾기</button>
        </div>

        <!-- 아이디 찾기 폼 -->
        <form id="formId" class="search-form ${activeTab eq 'pw' ? 'd-none' : ''}">
            <div class="mb-3">
                <label class="form-label">이름</label>
                <input type="text" name="userName" class="form-control" placeholder="가입 시 등록하신 이름을 입력해주세요.">
                <div class="invalid-feedback" id="errorNameId"></div>
            </div>
            <div class="mb-4">
                <label class="form-label">이메일</label>
                <input type="email" name="email" class="form-control" placeholder="가입 시 등록하신 이메일을 입력해주세요.">
                <div class="invalid-feedback" id="errorEmailId"></div>
            </div>
            <div class="d-flex gap-3 mt-3">
                <button id="btnSearchUserId" type="button" class="btn btn-primary flex-fill box-shadow">아이디 찾기</button>
                <button id="btnLogin1" type="button" class="btn btn-outline-secondary flex-fill box-shadow">로그인</button>
            </div>
        </form>

        <!-- 비밀번호 찾기 폼 -->
        <form id="formPw" class="search-form ${activeTab eq 'pw' ? '' : 'd-none'}">
            <div class="mb-3">
                <label class="form-label">아이디</label>
                <input type="text" name="userId" class="form-control" placeholder="가입 시 등록하신 아이디를 입력해주세요.">
                <div class="invalid-feedback" id="errorUserIdPw"></div>
            </div>
            <div class="mb-3">
                <label class="form-label">이름</label>
                <input type="text" name="userName" class="form-control" placeholder="가입 시 등록하신 이름을 입력해주세요.">
                <div class="invalid-feedback" id="errorNamePw"></div>
            </div>
            <div class="mb-4">
                <label class="form-label">이메일</label>
                <input type="email" name="email" class="form-control" placeholder="가입 시 등록하신 이메일을 입력해주세요.">
                <div class="invalid-feedback" id="errorEmailPw"></div>
            </div>
            <div class="d-flex gap-3 mt-3">
                <button id="btnSearchPassword" type="button" class="btn btn-primary flex-fill box-shadow">비밀번호 찾기</button>
                <button id="btnLogin2" type="button" class="btn btn-outline-secondary flex-fill box-shadow">로그인</button>
            </div>
        </form>

    </div>

    <!-- 오른쪽 (배너) -->
    <div class="search-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령">
    </div>
</div>
<script src="/js/common/formValidator.js"></script>
<script src="/js/user/searchUser.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
