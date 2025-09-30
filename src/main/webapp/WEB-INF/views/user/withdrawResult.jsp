<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>탈퇴 처리 결과</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <style>
        body { background:#f3f6ff; color:black;}
        .wr-wrap { max-width:640px; margin:0 auto; padding:60px 20px 80px; }
        .wr-card { background:#fff; border-radius:16px; padding:38px 34px; box-shadow:0 2px 14px rgba(0,0,0,.07); text-align:center; }
        .wr-status { font-size:18px; font-weight:600; margin-bottom:12px; }
        .wr-msg { font-size:15px; color:#444; margin-bottom:26px; word-break:keep-all; }
        .wr-actions button { min-width:140px; }
        .wr-success .wr-status { color:#1d5f2e; }
        .wr-already .wr-status { color:#6b4caf; }
        .wr-invalid .wr-status { color:#b30000; }
        .wr-fail .wr-status { color:#b30000; }
    </style>
</head>
<body>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/header.jsp" %>
<div class="app-body d-flex">
    <%@ include file="../common/sidebar.jsp" %>
    <main id="content" class="main-content flex-fill">
        <div class="wr-wrap">
            <%
                String status = (String) request.getAttribute("status");
                String msg = (String) request.getAttribute("msg");
                if(status == null) status = "fail";
                if(msg == null) msg = "처리 결과를 확인할 수 없습니다.";
            %>
            <div class="wr-card wr-<%=status%>">
                <div class="wr-status">
                    <%
                        switch (status) {
                            case "success" : out.print("탈퇴 완료"); break;
                            case "already" : out.print("이미 탈퇴된 계정"); break;
                            case "invalid" : out.print("유효하지 않은 링크"); break;
                            default: out.print("탈퇴 실패");
                        }
                    %>
                </div>
                <div class="wr-msg"><%= msg %></div>
                <div class="wr-actions d-flex justify-content-center gap-2 flex-wrap">
                    <button class="btn btn-primary" onclick="location.href='/'">홈으로</button>
                    <%
                        if(!"success".equals(status)) {
                    %>
                    <button class="btn btn-outline-secondary" onclick="location.href='/user/login'">로그인</button>
                    <%
                        }
                    %>
                </div>
            </div>
        </div>
    </main>
</div>
<script src="/js/common/header.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
