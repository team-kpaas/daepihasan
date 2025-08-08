<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String ssUserName = (String) session.getAttribute("SS_USER_NAME");
    boolean isLogin = (ssUserName != null && !ssUserName.isEmpty());
%>
<header>
    <div class="d-flex align-items-center">
        <button class="menu-toggle" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i>
        </button>
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="로고">
            <span class="logo-text">대피하산</span>
        </div>
    </div>
    <div class="header-right">
        <% if (isLogin) { %>
            <span class="me-3 text-white fw-bold"><%= ssUserName %> 님</span>
            <button id="btnMyPage" class="btn btn-secondary">마이페이지</button>
            <button id="btnLogout" class="btn btn-primary">로그아웃</button>
        <% } else { %>
            <button id="btnLogin" class="btn btn-primary">로그인</button>
            <button id="btnUserReg" class="btn btn-secondary">회원가입</button>
        <% } %>
    </div>
</header>