<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

<c:set var="CTX" value="${pageContext.request.contextPath}" />
<c:set var="IS_AUTH" value="${not empty sessionScope.SS_USER_NAME}" />
<script src="/js/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/board.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css"/>
<meta name="current-user-id" content="${sessionScope.SS_USER_ID}"/>
<meta name="_csrf" content="${_csrf.token}"/>
<meta name="_csrf_header" content="${_csrf.headerName}"/>
<c:set var="IS_OWNER" value="${sessionScope.SS_USER_ID eq item.regId}" />
<%@ include file="../common/header.jsp" %>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/sidebar.jsp" %>
<div id="contentShell" class="content-shell">
    <div class="read-wrap container-fluid">
        <!-- 상단 헤더 -->
        <div class="read-head d-flex flex-wrap align-items-start gap-3 mb-3">
            <div class="flex-grow">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <c:if test="${not empty item.categoryNm}">
                        <span class="badge rounded-pill text-bg-primary px-3 py-2">${item.categoryNm}</span>
                    </c:if>
                    <h2 class="mb-0 fw-bold">${fn:escapeXml(item.title)}</h2>
                </div>

                <div class="meta-inline text-muted small d-flex flex-wrap gap-3">
                    <span>
      <i class="fa-regular fa-user me-1"></i>
      ${item.regId}
    </span>
                    <span><i class="fa-regular fa-eye me-1"></i>${item.readCnt}</span>
                    <span>
          <i class="fa-regular fa-calendar me-1"></i>
          <c:choose>
              <c:when test="${not empty item.regDt}">
                  <c:out value="${fn:substring(fn:replace(item.regDt,'T',' '),0,16)}"/>
              </c:when>
              <c:otherwise>-</c:otherwise>
          </c:choose>
        </span>
                </div>
            </div>

            <!-- 우측 액션 (수정/삭제/목록) -->
            <div class="d-flex align-items-center gap-2 ms-auto">
                <c:if test="${IS_OWNER}">
                    <a href="${CTX}/notice/${item.noticeSeq}/edit" class="btn btn-outline-secondary btn-sm">
                        <i class="fa-solid fa-pen-to-square me-1"></i> 수정
                    </a>
                    <form method="post" action="${CTX}/notice/${item.noticeSeq}/delete"
                          onsubmit="return confirm('정말 삭제하시겠어요?')">
                        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                        <button type="submit" class="btn btn-outline-danger btn-sm">
                            <i class="fa-solid fa-trash-can me-1"></i> 삭제
                        </button>
                    </form>
                </c:if>
                <a href="${CTX}/notice/list" class="btn btn-outline-secondary btn-sm">
                    <i class="fa-solid fa-list-ul me-1"></i> 목록
                </a>
            </div>
        </div>

        <!-- 본문 카드 -->
        <div class="card read-card shadow-sm mb-3">
            <div class="card-body content-body">
                <c:out value="${item.contents}" escapeXml="false"/>
            </div>
        </div>

        <!-- 좋아요 / 공유 -->
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-2">
                <button id="btn-like" class="btn btn-like" data-id="${item.noticeSeq}" aria-pressed="${liked}">
                    <i class="<c:if test='${liked}'>fa-solid</c:if><c:if test='${!liked}'>fa-regular</c:if> fa-heart me-1"></i>
                    <span id="like-count">${likeCount}</span>
                </button>
                <button class="btn btn-outline-secondary btn-sm"
                        onclick="navigator.clipboard.writeText(location.href);this.innerText='복사됨!'; setTimeout(()=>this.innerHTML='<i class=&quot;fa-solid fa-link me-1&quot;></i>링크복사',1200)">
                    <i class="fa-solid fa-link me-1"></i>링크복사
                </button>
            </div>

            <!-- 이전/다음 (있으면 노출) -->
            <div class="d-flex gap-2">
                <c:if test="${not empty prev}">
                    <a class="btn btn-outline-secondary btn-sm" href="${CTX}/notice/${prev.noticeSeq}">
                        ← 이전글
                    </a>
                </c:if>
                <c:if test="${not empty next}">
                    <a class="btn btn-outline-secondary btn-sm" href="${CTX}/notice/${next.noticeSeq}">
                        다음글 →
                    </a>
                </c:if>
            </div>
        </div>

        <!-- 댓글 -->
        <div class="card shadow-sm">
            <div class="card-header bg-white d-flex align-items-center justify-content-between">
                <strong>댓글</strong>
                <small class="text-muted">
                    <span>
                    <i class="fa-regular fa-comment"></i>
                    <c:out value="${item.commentCnt}" default="0"/>
                    </span>
            </div>
            <div class="card-body">
                <form id="form-comment" class="mb-3" onsubmit="return false;">
        <textarea class="form-control mb-2" rows="3"
                  placeholder="댓글을 입력하세요" maxlength="2000" id="comment-contents"></textarea>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-primary btn-sm" id="btn-comment">
                            <i class="fa-regular fa-paper-plane me-1"></i> 등록
                        </button>
                    </div>
                </form>

                <ul id="comment-list" class="list-unstyled m-0"></ul>
                <div id="comment-empty" class="text-center text-muted py-3 d-none">첫 댓글을 남겨보세요!</div>
            </div>
        </div>
    </div>
</div>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
<script src="${pageContext.request.contextPath}/js/common/location.js"></script>
<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
<script src="${pageContext.request.contextPath}/js/notice.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>