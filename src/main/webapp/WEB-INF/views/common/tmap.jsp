<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
<%--    map api--%>
    <!-- 성능 최적화(선택) -->
    <link rel="preconnect" href="https://apis.openapi.sk.com" crossorigin>
    <link rel="preconnect" href="https://toptmaptile3.tmap.co.kr" crossorigin>
    <script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${tmapApiKey}"></script>
    <%--    폰트--%>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <%--    부트스트랩--%>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <%--   css--%>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
</head>
<body>
    <%@ include file="../common/header.jsp" %>
<%--지도--%>
    <div id="map_div"></div>
</body>
<script src="${pageContext.request.contextPath}/js/common/map.js"></script>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
</html>