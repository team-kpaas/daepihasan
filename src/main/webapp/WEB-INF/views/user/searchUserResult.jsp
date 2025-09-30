<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.daepihasan.dto.UserInfoDTO" %>
<%@ page import="com.daepihasan.util.CmmUtil" %>
<%
    UserInfoDTO rDTO = (UserInfoDTO) request.getAttribute("rDTO");
    if (rDTO == null) rDTO = new UserInfoDTO();

    String resultType = (String) request.getAttribute("resultType"); // "id" | "pw"
    if (resultType == null) resultType = "id";

    boolean found = !CmmUtil.nvl(rDTO.getUserId()).isEmpty();

    String msg;
    if ("id".equals(resultType)) {
        if (found) {
            msg = CmmUtil.nvl(rDTO.getUserName()) + " 회원님의 아이디는 <span class='text-highlight'>"
                    + CmmUtil.nvl(rDTO.getUserId()) + "</span> 입니다.";
        } else {
            msg = "아이디가 존재하지 않습니다.";
        }
    } else { // "pw"
        if (found) {
            msg = "회원 정보가 확인되었습니다."; // (실제로는 newPassword.jsp로 이동하므로 보일 일 없음)
        } else {
            msg = "존재하지 않는 회원입니다.";
        }
    }
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>아이디/비밀번호 찾기 결과</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/common/style.css" rel="stylesheet" >
    <link href="/css/user/searchUserResult.css" rel="stylesheet">
</head>
<body>
<div class="full-container">
    <div class="result-left">
        <div class="logo">
            <img src="${pageContext.request.contextPath}/images/logo-daepihasan.png" alt="대피하산 로고">
            <span class="logo-text">대피하산</span>
        </div>

        <div class="tab-container d-flex justify-content-center mb-4">
            <button id="tabId" type="button" class="tab-btn <%= "id".equals(resultType) ? "active" : "" %>">아이디 찾기</button>
            <button id="tabPw" type="button" class="tab-btn <%= "pw".equals(resultType) ? "active" : "" %>">비밀번호 찾기</button>
        </div>

        <div class="result-message text-center mt-6 mb-6">
            <%= msg %>
        </div>

        <div class="d-flex justify-content-center btn-container">
            <% if (found) { %>
            <!-- 결과가 있을 때: 로그인 버튼 -->
            <button id="btnLogin" type="button" class="btn btn-primary w-100 mt-3 mb-3">로그인</button>
            <% } else { %>
            <!-- 결과가 없을 때: 회원가입 버튼 -->
            <button id="btnSignup" type="button" class="btn btn-primary w-100 mt-3 mb-3">회원가입</button>
            <% } %>
        </div>
    </div>

    <div class="result-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령">
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/user/searchUserResult.js"></script>
</body>
</html>
