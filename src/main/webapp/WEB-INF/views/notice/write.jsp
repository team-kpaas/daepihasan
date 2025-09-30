<%@ page contentType="text/html; charset=UTF-8" %>
<div class="board-wrap container-fluid px-0">
    <form method="post" action="">
        <div class="card shadow-sm mb-3">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label">카테고리</label>
                        <select class="form-select" name="categoryId" required>
                            <option value="">선택</option>
                            <c:forEach var="cat" items="${categoryList}">
                                <option value="${cat.id}" <c:if test="${item.categoryId == cat.id}">selected</c:if>>
                                        ${cat.categoryNm}
                                </option>
                            </c:forEach>
                        </select>
                    </div>
                    <div class="col-md-9">
                        <label class="form-label">제목</label>
                        <input type="text" class="form-control" name="title" value="${item.title}" maxlength="1000" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">내용</label>
                        <textarea name="contents" class="form-control" rows="12" required>${item.contents}</textarea>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex gap-2 justify-content-end">
            <a href="${pageContext.request.contextPath}/notice/list" class="btn btn-outline-secondary">취소</a>
            <button class="btn btn-primary">저장</button>
        </div>
    </form>
</div>

<link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/board.css">