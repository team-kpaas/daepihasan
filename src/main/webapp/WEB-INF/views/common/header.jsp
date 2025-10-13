<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- Font Awesome CDN (최신 6.x, 필요시 5.x로 변경 가능) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

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
        <!-- 챗봇 아이콘 버튼 (심플, 텍스트 포함) -->
        <button id="chatbotBtn" class="chatbot-btn ms-2" title="챗봇 열기">
            <i class="fas fa-robot" style="font-size: 1.2rem; color: #4b6cb7; vertical-align: middle;"></i>
            <span style="margin-left: 6px; font-weight: 500; color: #222; vertical-align: middle;">챗봇</span>
        </button>
    </div>
</header>

<!-- 챗봇 모달 -->
<div id="chatbotModal" class="chatbot-modal" style="display:none;">
    <div class="chatbot-modal-content">
        <span class="chatbot-modal-close" id="chatbotModalClose">&times;</span>
        <div class="chatbot-modal-header">
            <span class="chatbot-title">산불 예방 및 대책 안내 챗봇</span>
        </div>
        <div class="chatbot-modal-body" id="chatbotChatArea">
            <!-- 대화 내용 표시 영역 -->
        </div>
        <div class="chatbot-modal-footer">
            <input type="text" id="chatbotInput" class="chatbot-input" placeholder="질문을 입력하세요..." autocomplete="off" />
            <button id="chatbotSendBtn" class="chatbot-send-btn">전송</button>
        </div>
    </div>
</div>

<!-- 챗봇 모달 스타일 및 동작 -->
<link rel="stylesheet" href="/css/modal/chatbot-modal.css">
<script src="/js/modal/chatbot-modal.js"></script>
