<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <title>산불 위험 예보</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <style>
    </style>
</head>
<body>
<%@ include file="../common/header.jsp" %>
<div class="app-body d-flex">
    <%@ include file="../common/sidebar.jsp" %>
    <main id="content" class="main-content flex-fill">

    </main>
</div>
<script>

</script>
<script src="/js/common/header.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
