<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<meta name="ctx" content="${pageContext.request.contextPath}">
<meta name="is-auth" content="${pageContext.request.userPrincipal != null}">
<c:set var="CTX" value="${pageContext.request.contextPath}" />
<c:set var="IS_AUTH" value="${not empty sessionScope.SS_USER_NAME}" />
<script src="/js/jquery-3.7.1.min.js"></script>

<link rel="stylesheet" href="${pageContext.request.contextPath}/css/board.css?v=20251028-02">
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css"/>

<!-- 폰트/아이콘/부트스트랩 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<style>
    body{
        background-color: #f3f6ff;
    }
    /* ===== 페이지 전용 오버라이드 ===== */
    /* 데스크톱(> 1370px): 사이드바를 고정, 본문을 오른쪽으로 배치 */
    @media (min-width: 1371px) {
        .sidebar {
            position: fixed !important;
            top: 60px;                 /* header 높이 */
            left: 0;
            height: calc(100svh - 60px);
            transform: none !important;  /* 혹시 모를 변환 제거 */
            z-index: 1200;
        }
        /* 사이드바 너비만큼 본문 밀기 */
        .content-with-sidebar {
            margin-left: 400px;         /* .sidebar { width: 400px } 기준 */
            padding: 16px;
        }
    }

    /* 태블릿/모바일(<= 1370px): 기존 sidebar.css 동작(슬라이드) 유지 */
    @media (max-width: 1370px) {
        .content-with-sidebar {
            margin-left: 0;
            padding: 12px 8px;
        }
    }

    /* UX: 행 전체 클릭 커서 */
    .board-card table tbody tr[role="button"] { cursor: pointer; }
</style>
<%@ include file="../common/header.jsp" %>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/sidebar.jsp" %>
<div class="content-with-sidebar">
    <div class="board-wrap board-right container-fluid px-0">
    <!-- 히어로 + 필터 -->
        <div class="board-hero mb-3">
            <div class="d-flex align-items-center gap-2">
                <h2 class="mb-0">게시판</h2>
                <span class="ms-2 meta-inline">
            총 <strong>${total}</strong>건
          </span>
                <div class="ms-auto">
                    <a id="btnWrite"
                       class="btn btn-primary btn-sm"
                       href="${IS_AUTH ? CTX.concat('/notice/write') : CTX.concat('/user/login')}"
                       data-auth="${IS_AUTH}"
                       data-ctx="${CTX}">
                        <i class="fa-solid fa-pen-to-square me-1"></i> 글쓰기
                    </a>
                </div>
            </div>

            <form class="board-toolbar d-flex flex-wrap" method="get"
                  action="${pageContext.request.contextPath}/notice/list">
                <select class="form-select form-select-sm" name="categoryId" aria-label="카테고리 선택">
                    <option value="">전체 카테고리</option>
                    <c:forEach var="cat" items="${categoryList}">
                        <option value="${cat.id}" <c:if test="${search.categoryId == cat.id}">selected</c:if>>
                                ${cat.categoryNm}
                        </option>
                    </c:forEach>
                </select>

                <select class="form-select form-select-sm" name="orderBy" aria-label="정렬">
                    <option value=""                            <c:if test="${empty search.orderBy}">selected</c:if>>최신순</option>
                    <option value="read"     <c:if test="${search.orderBy == 'read'}">selected</c:if>>조회수순</option>
                    <option value="comment"  <c:if test="${search.orderBy == 'comment'}">selected</c:if>>댓글순</option>
                    <option value="old"      <c:if test="${search.orderBy == 'old'}">selected</c:if>>오래된순</option>
                </select>

                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" name="keyword"
                           value="${fn:escapeXml(search.keyword)}" placeholder="검색어 (제목/내용)">
                    <button class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>
            </form>

            <!-- 카테고리 칩 (선택사항: 빠른 필터) -->
            <div class="cat-chips" role="tablist" aria-label="빠른 카테고리">
                <a class="cat-chip <c:if test='${empty search.categoryId}'>active</c:if>"
                   href="${pageContext.request.contextPath}/notice/list">전체</a>
                <c:forEach var="cat" items="${categoryList}">
                    <c:url var="catUrl" value="/notice/list">
                        <c:param name="categoryId" value="${cat.id}"/>
                        <c:param name="orderBy"    value="${search.orderBy}"/>
                        <c:param name="keyword"    value="${search.keyword}"/>
                    </c:url>
                    <a class="cat-chip <c:if test='${search.categoryId == cat.id}'>active</c:if>" href="${catUrl}">
                            ${cat.categoryNm}
                    </a>
                </c:forEach>
            </div>
        </div>

        <!-- 목록 카드 -->
        <div class="board-card">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                    <tr>
                        <th style="width:70px" class="text-center">번호</th>
                        <th>제목</th>
                        <th style="width:160px" class="text-end d-none d-md-table-cell">조회</th>
                        <th style="width:180px" class="text-end">작성일</th>
                    </tr>
                    </thead>
                    <tbody>
                    <c:forEach var="n" items="${list}">
                        <%-- [공지글 표시 추가] category_id == 1인 경우 공지로 인식 --%>
                        <c:set var="isNotice" value="${n.categoryId == 1}" />

                        <tr role="button"
                            class="${isNotice ? 'row-notice' : ''}"
                            onclick="location.href='${pageContext.request.contextPath}/notice/${n.noticeSeq}'">

                            <!-- 번호 -->
                            <td class="text-center">
                                <c:if test="${isNotice}">
                                    <i class="fa-solid fa-thumbtack icon-pin" aria-label="공지"></i>
                                </c:if>
                                    ${n.noticeSeq}
                            </td>

                            <!-- 제목 + 카테고리 + 작성자 -->
                            <td>
                                <div class="title-cell">
                                    <c:if test="${isNotice}">
                                        <span class="badge-notice">공지</span>
                                    </c:if>

                                    <span class="fw-semibold text-dark">${fn:escapeXml(n.title)}</span>

                                        <%-- [카테고리 표시] --%>
                                    <c:if test="${not empty n.categoryNm}">
                                        <span class="badge-cat ms-1">${n.categoryNm}</span>
                                    </c:if>
                                </div>

                                    <%-- [작성자 / 메타 정보] --%>
                                <div class="meta-inline mt-1 text-muted small">
                                    <span class="me-3"><i class="fa-regular fa-user"></i> ${n.regId}</span>
                                    <span class="me-3">
                                        <i class="fa-regular fa-heart"></i>
                                        <c:out value="${n.likeCnt}" default="0"/>
                                    </span>
                                    <c:if test="${not empty n.commentCnt}">
                                        <span><i class="fa-regular fa-comment"></i> ${n.commentCnt}</span>
                                    </c:if>
                                </div>
                            </td>

                            <!-- 조회수 (데스크톱 전용) -->
                            <td class="text-end d-none d-md-table-cell">
                                <span class="icon-stat"><i class="fa-regular fa-eye"></i> ${n.readCnt}</span>
                            </td>

                            <!-- 작성일 -->
                            <td class="text-end">
                                <small>
                                    <c:choose>
                                        <c:when test="${not empty n.regDt}">
                                            <c:out value="${fn:substring(fn:replace(n.regDt, 'T', ' '), 0, 16)}"/>
                                        </c:when>
                                        <c:otherwise>-</c:otherwise>
                                    </c:choose>
                                </small>
                            </td>
                        </tr>
                    </c:forEach>

                    <c:if test="${empty list}">
                        <tr>
                            <td colspan="4">
                                <div class="empty">

                                    아직 게시글이 없습니다. 첫 글을 작성해보세요!
                                </div>
                            </td>
                        </tr>
                    </c:if>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 페이지네이션 -->
        <nav class="mt-3">
            <ul class="pagination pagination-sm justify-content-center mb-0">
                <c:set var="curr" value="${page}" />
                <c:set var="last" value="${totalPages}" />

                <c:url var="prevUrl" value="/notice/list">
                    <c:param name="page"       value="${curr-1}"/>
                    <c:param name="size"       value="${size}"/>
                    <c:param name="keyword"    value="${search.keyword}"/>
                    <c:param name="categoryId" value="${search.categoryId}"/>
                    <c:param name="orderBy"    value="${search.orderBy}"/>
                </c:url>
                <li class="page-item <c:if test='${curr==1}'>disabled</c:if>">
                    <a class="page-link" href="${prevUrl}">이전</a>
                </li>

                <c:forEach var="p" begin="${curr-2 < 1 ? 1 : curr-2}" end="${curr+2 > last ? last : curr+2}">
                    <c:url var="pageUrl" value="/notice/list">
                        <c:param name="page"       value="${p}"/>
                        <c:param name="size"       value="${size}"/>
                        <c:param name="keyword"    value="${search.keyword}"/>
                        <c:param name="categoryId" value="${search.categoryId}"/>
                        <c:param name="orderBy"    value="${search.orderBy}"/>
                    </c:url>
                    <li class="page-item <c:if test='${p==curr}'>active</c:if>">
                        <a class="page-link" href="${pageUrl}">${p}</a>
                    </li>
                </c:forEach>

                <c:url var="nextUrl" value="/notice/list">
                    <c:param name="page"       value="${curr+1}"/>
                    <c:param name="size"       value="${size}"/>
                    <c:param name="keyword"    value="${search.keyword}"/>
                    <c:param name="categoryId" value="${search.categoryId}"/>
                    <c:param name="orderBy"    value="${search.orderBy}"/>
                </c:url>
                <li class="page-item <c:if test='${curr==last}'>disabled</c:if>">
                    <a class="page-link" href="${nextUrl}">다음</a>
                </li>
            </ul>
        </nav>
    </div>
</div>

<script>
    (function () {
        const form = document.getElementById('boardSearchForm');
        const cat  = form?.querySelector('select[name="categoryId"]');
        const ord  = form?.querySelector('select[name="orderBy"]');

        // ✅ 드롭다운 바뀌면 즉시 제출
        cat && cat.addEventListener('change', () => form.submit());
        ord && ord.addEventListener('change', () => form.submit());
    })();
</script>

<script src="${pageContext.request.contextPath}/js/common/header.js"></script>

<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>
<script src="${pageContext.request.contextPath}/js/common/location.js"></script>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>