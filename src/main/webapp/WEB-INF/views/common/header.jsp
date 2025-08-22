<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

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
        <c:choose>
            <%-- 로그인 상태: 세션에 SS_USER_NAME 있으면 --%>
            <c:when test="${not empty sessionScope.SS_USER_NAME}">
                <span class="user-name me-3 fw-bold">
                  <c:out value="${sessionScope.SS_USER_NAME}" /> 님
                </span>
                <button id="btnMyPage" class="btn btn-secondary">마이페이지</button>
                <button id="btnLogout" class="btn btn-primary">로그아웃</button>
            </c:when>
            <%-- 비로그인 상태 --%>
            <c:otherwise>
                <button id="btnLogin" class="btn btn-primary">로그인</button>
                <button id="btnUserReg" class="btn btn-secondary">회원가입</button>
            </c:otherwise>
        </c:choose>
    </div>
</header>