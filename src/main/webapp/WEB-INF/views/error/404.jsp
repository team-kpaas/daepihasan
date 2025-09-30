<%@ page contentType="text/html; charset=UTF-8" isErrorPage="true" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>페이지를 찾을 수 없습니다</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="${pageContext.request.contextPath}/js/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <style>
        body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f5f7fb;color:#222;}
        .app-body{display:flex;min-height:calc(100vh - 60px);} /* header 높이 가정 */
        .main-area{flex:1;display:flex;justify-content:center;align-items:flex-start;padding:60px 32px;}
        .error-box{
            width:100%;
            max-width:780px;
            background:#fff;
            padding:48px 46px;
            border-radius:22px;
            box-shadow:0 6px 28px rgba(0,0,0,.07);
        }
        .error-box h1{
            margin:0 0 18px;
            font-size:68px;
            letter-spacing:2px;
            line-height:1;
            background:linear-gradient(90deg,#1f3c88,#4069d8);
            -webkit-background-clip:text;
            color:transparent;
        }
        .error-box p{margin:0 0 30px;font-size:16px;line-height:1.55;color:#444;}
        .error-box a.btn{
            padding:14px 30px;
            border-radius:12px;
            background:#1f3c88;
            color:#fff;
            font-weight:600;
            font-size:15px;
            text-decoration:none;
        }
        .error-box a.btn:hover{background:#284da8;}
        .error-box .small{font-size:12px;color:#888;margin-top:38px;}
        @media (max-width: 840px){
            .main-area{padding:40px 18px;}
            .error-box{padding:42px 32px;}
            .error-box h1{font-size:56px;}
        }
    </style>
</head>
<body>
<%@ include file="../common/header.jsp" %>
<div class="app-body">
    <%@ include file="../common/sidebar.jsp" %>
    <main class="main-area">
        <div class="error-box">
            <h1>404</h1>
            <p>요청하신 페이지가 존재하지 않거나<br>이동/삭제되었을 수 있습니다.</p>
            <a class="btn" href="/">메인으로 이동</a>
            <div class="small">불편을 드려 죄송합니다.</div>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
<script src="${pageContext.request.contextPath}/js/common/location.js"></script>
<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
</body>
</html>
