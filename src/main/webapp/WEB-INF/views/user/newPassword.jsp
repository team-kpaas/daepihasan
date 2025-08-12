<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.daepihasan.dto.UserInfoDTO" %>
<%@ page import="com.daepihasan.util.CmmUtil" %>
<%
    UserInfoDTO rDTO = (UserInfoDTO) request.getAttribute("rDTO");
    String newPassword = CmmUtil.nvl((String) session.getAttribute("NEW_PASSWORD"));
    String msg = "";

    if (CmmUtil.nvl(rDTO.getUserId()).length() > 0) {
        if (newPassword.length() == 0) {
            msg = "비정상적인 접근입니다.\n비밀번호 재설정 화면에 접근할 수 없습니다.";
        }
    } else {
        msg = "회원정보가 존재하지 않습니다.";
    }
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><%=CmmUtil.nvl(rDTO.getUserName())%>님의 비밀번호 재설정</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/css/common/style.css">
    <link rel="stylesheet" href="/css/user/newPassword.css">
    <script src="/js/jquery-3.7.1.min.js"></script>
</head>
<body>
<div class="full-container">
    <!-- 왼쪽 (비밀번호 재설정 폼) -->
    <div class="newpw-left">
        <!-- 로고 -->
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
            <span class="logo-text">대피하산</span>
        </div>

        <!-- 상단 탭 -->
        <div class="tab-container d-flex justify-content-center mb-4">
            <button id="tabId" class="tab-btn">아이디 찾기</button>
            <button id="tabPw" class="tab-btn active">비밀번호 찾기</button>
        </div>

        <!-- 안내 문구 -->
        <div class="mb-4 text-center newpw-title">
            <%=CmmUtil.nvl(rDTO.getUserName())%> 회원님의 비밀번호를 재설정 해주세요.
        </div>

        <!-- 비밀번호 재설정 폼 -->
        <form id="formPw" class="newpw-form">
            <div class="mb-3">
                <label class="form-label">새 비밀번호</label>
                <input type="password" name="password" class="form-control" placeholder="새 비밀번호를 입력하세요.">
                <div class="invalid-feedback" id="errorPassword"></div>
            </div>
            <div class="mb-4">
                <label class="form-label">비밀번호 확인</label>
                <input type="password" name="password2" class="form-control" placeholder="비밀번호를 다시 입력하세요.">
                <div class="invalid-feedback" id="errorPassword2"></div>
            </div>
            <div class="d-flex gap-3 mt-3">
                <button id="btnChangePw" type="button" class="btn btn-primary flex-fill">비밀번호 재설정</button>
                <button id="btnLogin" type="button" class="btn btn-outline-secondary flex-fill">로그인</button>
            </div>
        </form>
    </div>

    <!-- 오른쪽 (배너) -->
    <div class="newpw-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령">
    </div>
</div>
<script src="/js/common/formValidator.js"></script>
<script src="/js/user/newPassword.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>