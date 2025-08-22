<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <%--   css--%>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
</head>
<body>
    <%@ include file="../common/header.jsp" %>
<%--지도--%>
    <div id="map_div" style="width:100%; height: calc(100vh - 160px); border-radius:12px;"></div>



</body>
</html>