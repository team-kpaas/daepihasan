<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대피하산</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="/css/common/header.css">
    <link rel="stylesheet" href="/css/common/sidebar.css">
    <link rel="stylesheet" href="/css/common/weather.css">
    <style>

        body {
            background-color: #e1f0ff;
            margin: 0;
            font-family: 'NanumSquare', sans-serif;
        }

        .main-content {
            padding: 20px;
            background-color: #e1f0ff;
        }

        .card {
            border-radius: 10px;
        }

    </style>
</head>
<body>
<%@ include file="/WEB-INF/views/common/header.jsp" %>
<div class="d-flex">
    <%@ include file="/WEB-INF/views/common/sidebar.jsp" %>

    <main class="main-content flex-fill">
        <h4 class="fw-bold mb-4">페이지별 내용</h4>

    </main>
</div>
<script src="/js/common/header.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
