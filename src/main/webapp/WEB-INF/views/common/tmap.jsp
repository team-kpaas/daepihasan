<%--<!doctype html>--%>
<%--<html lang="en">--%>
<%--<head>--%>
<%--    <meta charset="UTF-8">--%>
<%--    <meta name="viewport"--%>
<%--          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">--%>
<%--    <meta http-equiv="X-UA-Compatible" content="ie=edge">--%>
<%--    <%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>--%>
<%--    <title>Document</title>--%>
<%--    <meta name="ctx" content="${pageContext.request.contextPath}">--%>
<%--&lt;%&ndash;    map api&ndash;%&gt;--%>
<%--    <!-- 성능 최적화(선택) -->--%>
<%--    <link rel="preconnect" href="https://apis.openapi.sk.com" crossorigin>--%>
<%--    <link rel="preconnect" href="https://toptmaptile3.tmap.co.kr" crossorigin>--%>
<%--    <script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${tmapApiKey}"></script>--%>
<%--    &lt;%&ndash;    폰트&ndash;%&gt;--%>
<%--    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">--%>
<%--    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">--%>
<%--    &lt;%&ndash;    부트스트랩&ndash;%&gt;--%>
<%--    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">--%>
<%--    <script src="/js/jquery-3.7.1.min.js"></script>--%>
<%--    &lt;%&ndash;   css&ndash;%&gt;--%>
<%--    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/map.css">--%>
<%--    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/mapSidebar.css">--%>
<%--</head>--%>
<%--<body>--%>

<%--&lt;%&ndash;지도&ndash;%&gt;--%>
<%--    <div id="map_div"></div>--%>

<%--    <header>--%>
<%--        &lt;%&ndash;검색바&ndash;%&gt;--%>
<%--        <div class="search-bar">--%>
<%--            <div class="map-search-form">--%>
<%--                <button id="btnSidebarInSearch" class="menu-in-search" title="메뉴" aria-label="메뉴"--%>
<%--                        onclick="toggleSidebar()">--%>
<%--                    <i class="fa-solid fa-bars" aria-hidden="true"></i>--%>
<%--                </button>--%>
<%--                <input type="search" id="mapSearchInput" placeholder="장소, 주소 검색" aria-label="지도 검색">--%>
<%--                <button id="mapSearchBtn"><i class="fa-solid fa-magnifying-glass"></i></button>--%>
<%--                <ul id="searchSuggest" class="search-suggest" role="listbox" aria-label="검색 제안"></ul>--%>
<%--            </div>--%>
<%--        </div>--%>
<%--            <button>--%>
<%--                <i class="fa-solid fa-route"></i>--%>
<%--                <p>길찾기</p>--%>
<%--            </button>--%>
<%--    </header>--%>

<%--    <%@ include file="sidebar.jsp" %>--%>
<%--<button class="side-peek" type="button" aria-label="사이드바 열기" onclick="toggleSidebar()">--%>
<%--    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>--%>
<%--</button>--%>
<%--<div class="zoom-controls" role="group" aria-label="지도 확대/축소">--%>
<%--    <button id="btnZoomIn" class="zoom-btn" title="확대" aria-label="확대">--%>
<%--        <i class="fa-solid fa-plus" aria-hidden="true"></i>--%>
<%--    </button>--%>
<%--    <button id="btnZoomOut" class="zoom-btn" title="축소" aria-label="축소">--%>
<%--        <i class="fa-solid fa-minus" aria-hidden="true"></i>--%>
<%--    </button>--%>
<%--</div>--%>
<%--<div class="map-controls">--%>
<%--    <button id="btnMyLocation" class="ctrl" title="내 위치" aria-label="내 위치" >--%>
<%--        <i class="fa-solid fa-location-crosshairs"></i>--%>
<%--    </button>--%>
<%--</div>--%>
<%--</body>--%>
<%--<script src="${pageContext.request.contextPath}/js/map/map.js?v=20250828"></script>--%>
<%--&lt;%&ndash;<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>&ndash;%&gt;--%>
<%--</html>--%>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <title>Document</title>
    <meta name="ctx" content="${pageContext.request.contextPath}">
    <!-- Tmap -->
    <link rel="preconnect" href="https://apis.openapi.sk.com" crossorigin>
    <link rel="preconnect" href="https://toptmaptile3.tmap.co.kr" crossorigin>
    <script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${tmapApiKey}"></script>
    <!-- 폰트/아이콘/부트스트랩 -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <!-- css -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/map.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/mapSidebar.css">
</head>
<body>

<!-- 지도 -->
<div id="map_div"></div>

<header>
    <!-- 검색바 -->
    <div class="search-bar">
        <div class="map-search-form">
            <button id="btnSidebarInSearch" class="menu-in-search" title="메뉴" aria-label="메뉴" onclick="toggleSidebar()">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
            <input type="search" id="mapSearchInput" placeholder="장소, 주소 검색" aria-label="지도 검색">
            <button id="mapSearchBtn"><i class="fa-solid fa-magnifying-glass"></i></button>
            <ul id="searchSuggest" class="search-suggest" role="listbox" aria-label="검색 제안"></ul>
        </div>
    </div>
    <button>
        <i class="fa-solid fa-route"></i>
        <p>길찾기</p>
    </button>
</header>

<%@ include file="sidebar.jsp" %>

<button class="side-peek" type="button" aria-label="사이드바 열기" onclick="toggleSidebar()">
    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
</button>

<!-- 확대/축소 -->
<div class="zoom-controls" role="group" aria-label="지도 확대/축소">
    <button id="btnZoomIn" class="zoom-btn" title="확대" aria-label="확대">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
    </button>
    <button id="btnZoomOut" class="zoom-btn" title="축소" aria-label="축소">
        <i class="fa-solid fa-minus" aria-hidden="true"></i>
    </button>
</div>

<!-- 우하단 기본 컨트롤 -->
<%--<div class="map-controls">--%>
<%--    <button id="btnMyLocation" class="ctrl" title="내 위치" aria-label="내 위치">--%>
<%--        <i class="fa-solid fa-location-crosshairs"></i>--%>
<%--    </button>--%>
<%--</div>--%>


<div class="fab-cluster" aria-label="빠른 실행">
    <button id="btnMyLocation" class="fab" title="내 위치">
        <i class="fa-solid fa-location-crosshairs"></i>
    </button>
    <button id="fabRefresh" class="fab" title="새로고침">
        <i class="fa-solid fa-rotate-right"></i>
    </button>
</div>


<div class="bottom-bar" role="region" aria-label="필터 및 상태">
    <div class="chips">
        <button class="chip is-on" data-type="hydrant" aria-pressed="true">소화전</button>
        <button class="chip" data-type="tower" aria-pressed="false">급수탑</button>
        <button class="chip" data-type="ebox" aria-pressed="false">비상소화장치</button>
        <button class="chip" data-type="reservoir" aria-pressed="false">저수조</button>
    </div>
    <span class="status" id="facStatus">화면 내 0개</span>
</div>


<div id="sheet" class="sheet" aria-hidden="true">
    <div class="handle"></div>
    <div class="sheet-content" id="sheetContent"></div>
</div>

</body>
<script src="${pageContext.request.contextPath}/js/map/map.js?v=20250828"></script>
</html>
