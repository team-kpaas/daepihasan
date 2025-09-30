<%@ page contentType="text/html; charset=UTF-8" %>
<div class="board-wrap container-fluid px-0">
    <!-- 제목/메타 -->
    <div class="card shadow-sm mb-3">
        <div class="card-body">
            <div class="d-flex align-items-start gap-3">
                <div class="badge rounded-pill text-bg-primary px-3 py-2">${item.categoryNm}</div>
                <h3 class="flex-grow-1 mb-0">${item.title}</h3>
                <div class="d-flex gap-2">
                    <a href="${pageContext.request.contextPath}/notice/${item.noticeSeq}/edit" class="btn btn-outline-secondary btn-sm">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </a>
                    <form method="post" action="${pageContext.request.contextPath}/notice/${item.noticeSeq}/delete" onsubmit="return confirm('삭제할까요?')">
                        <button class="btn btn-outline-danger btn-sm"><i class="fa-solid fa-trash-can"></i></button>
                    </form>
                </div>
            </div>

            <div class="mt-2 text-muted small d-flex gap-3 flex-wrap">
                <span><i class="fa-regular fa-eye me-1"></i>${item.readCnt}</span>
                <span><i class="fa-regular fa-calendar me-1"></i>${item.regDt}</span>
            </div>
        </div>
    </div>

    <!-- 본문 -->
    <div class="card shadow-sm mb-3">
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
            <button class="btn btn-outline-secondary btn-sm" onclick="navigator.clipboard.writeText(location.href);this.innerText='복사됨!'">
                <i class="fa-solid fa-link me-1"></i>링크복사
            </button>
        </div>
        <a href="${pageContext.request.contextPath}/notice/list" class="btn btn-outline-secondary btn-sm">목록</a>
    </div>

    <!-- 댓글 -->
    <div class="card shadow-sm">
        <div class="card-header bg-white">
            <strong>댓글</strong>
        </div>
        <div class="card-body">
            <form id="form-comment" class="mb-3" onsubmit="return false;">
                <textarea class="form-control mb-2" rows="3" placeholder="댓글을 입력하세요" maxlength="2000" id="comment-contents"></textarea>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-primary btn-sm" id="btn-comment">등록</button>
                </div>
            </form>
            <ul id="comment-list" class="list-unstyled m-0"></ul>
            <div id="comment-empty" class="text-center text-muted py-3 d-none">첫 댓글을 남겨보세요!</div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/notice.js"></script>
<link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/board.css">