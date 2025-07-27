<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.daepihasan.dto.UserInfoDTO" %>
<%@ page import="com.daepihasan.util.CmmUtil" %>
<%
    UserInfoDTO rDTO = (UserInfoDTO) request.getAttribute("rDTO");
    String msg;

    if (!CmmUtil.nvl(rDTO.getUserId()).isEmpty()) {
        msg = CmmUtil.nvl(rDTO.getUserName()) + " 회원님의 아이디는 <span class='text-highlight'>"
                + CmmUtil.nvl(rDTO.getUserId()) + "</span> 입니다.";
    } else {
        msg = "아이디가 존재하지 않습니다.";
    }
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>아이디 찾기 결과</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/user/searchUserResult.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
</head>
<body>
<div class="full-container">
    <!-- 왼쪽 -->
    <div class="result-left">
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
        </div>

        <!-- 탭 -->
        <div class="tab-container d-flex justify-content-center mb-4">
            <button id="tabId" class="tab-btn active">아이디 찾기</button>
            <button id="tabPw" class="tab-btn">비밀번호 찾기</button>
        </div>

        <!-- 결과 표시 -->
        <div class="result-message text-center mt-6 mb-6">
            <%= msg %>
        </div>

        <!-- 로그인 버튼 -->
        <div class="d-flex justify-content-center btn-container">
            <button id="btnLogin" type="button" class="btn btn-primary w-100 mt-3 mb-3">로그인</button>
        </div>
    </div>

    <!-- 오른쪽 배너 -->
    <div class="result-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령">
    </div>
</div>

<script src="/js/user/searchUserResult.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
