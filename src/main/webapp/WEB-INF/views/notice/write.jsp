<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<script src="/js/jquery-3.7.1.min.js"></script>
<c:set var="CTX" value="${pageContext.request.contextPath}" />
<c:set var="IS_AUTH" value="${not empty sessionScope.SS_USER_NAME}" />

<link rel="stylesheet" href="${pageContext.request.contextPath}/css/board.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css"/>

<%@ include file="../common/header.jsp" %>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/sidebar.jsp" %>
<div id="contentShell" class="content-shell">
    <div class="compose-wrap container-fluid">
        <!-- 상단 헤더(페이지 타이틀/부가 정보) -->
        <div class="compose-head">
            <div>
                <h2>게시글 작성</h2>
                <p class="sub">카테고리를 선택하고 제목/내용을 입력해 주세요.</p>
            </div>
            <div class="hint d-none d-md-block"><kbd></kbd> <kbd></kbd></div>
        </div>

        <form id="noticeForm" method="post" action="">
            <div class="card compose-card">
                <div class="card-body">
                    <div class="row g-4">
                        <!-- 카테고리 -->
                        <div class="col-12 col-md-4">
                            <label class="form-label required">카테고리</label>
                            <select class="form-select" name="categoryId" required>
                                <option value="">선택하세요</option>
                                <c:forEach var="cat" items="${categoryList}">
                                    <option value="${cat.id}" <c:if test="${item.categoryId == cat.id}">selected</c:if>>
                                            ${cat.categoryNm}
                                    </option>
                                </c:forEach>
                            </select>
                        </div>

                        <!-- 제목 -->
                        <div class="col-12 col-md-8">
                            <label class="form-label required d-flex justify-content-between align-items-center">
                                <span>제목</span>
                                <small class="counter"><span id="titleCnt">0</span>/100</small>
                            </label>
                            <input type="text"
                                   class="form-control form-control-lg"
                                   name="title"
                                   maxlength="100"
                                   value="${item.title}"
                                   placeholder="제목을 입력하세요"
                                   required>
                        </div>

                        <!-- 내용 -->
                        <div class="col-12">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="form-label required mb-1">내용</label>
                                <small class="counter"><span id="bodyCnt">0</span>/3000</small>
                            </div>

                            <div class="editor-box">
                  <textarea name="contents"
                            id="contents"
                            class="form-control editor"
                            rows="12"
                            maxlength="3000"
                            placeholder="내용을 입력하세요 (이미지/파일은 추후 첨부 영역에서 업로드하세요)"
                            required>${item.contents}</textarea>
                            </div>

                            <!-- (선택) 태그 입력 영역 필요하면 주석 해제
                            <div class="mt-3">
                              <label class="form-label mb-1">태그</label>
                              <input type="text" name="tags" class="form-control" placeholder="쉼표(,)로 구분해서 입력">
                            </div>
                            -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 하단 고정 액션바 -->
            <div class="compose-actions">
                <div class="inner d-flex gap-2 justify-content-end">
                    <a href="${pageContext.request.contextPath}/notice/list" class="btn btn-outline-secondary">취소</a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-floppy-disk me-1"></i> 저장
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
<script src="${pageContext.request.contextPath}/js/common/location.js"></script>
<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
<script src="${pageContext.request.contextPath}/js/notice.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>