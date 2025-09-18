<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- ★ 컨텍스트 경로: JS가 읽어감 -->
    <meta name="ctx" content="${pageContext.request.contextPath}">
    <script>window.__CTX__ = '${pageContext.request.contextPath}';</script>
    <title>지도</title>

    <!-- (선택) 파비콘 404 방지 -->
    <link rel="icon" href="${pageContext.request.contextPath}/favicon.ico">

    <!-- Tmap -->

     <link rel="preconnect" href="https://apis.openapi.sk.com" crossorigin>
    <link rel="preconnect" href="https://toptmaptile3.tmap.co.kr" crossorigin>
    <script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${tmapApiKey}"></script>
    <meta name="tmap-key" content="${tmapApiKey}">


    <!-- 폰트/아이콘/부트스트랩 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <!-- 앱 CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/map.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/mapSidebar.css">

    <!-- 안전망: 지도 높이 보장(프로덕션에선 map.css에 둬도 됨) -->
    <style>
        html,body{height:100%}
        #map_div{height:100vh;width:100%}
    </style>
</head>
<body>

<!-- 지도 -->
<div id="map_div"></div>

<!-- 헤더/검색바 -->
<header>
    <div class="search-bar">
        <div class="map-search-form">
            <button id="btnSidebarInSearch" class="menu-in-search" title="메뉴" aria-label="메뉴" onclick="toggleSidebar()">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
            <input type="search" id="mapSearchInput" placeholder="장소, 주소 검색" aria-label="지도 검색">
            <button id="mapSearchBtn" type="button"><i class="fa-solid fa-magnifying-glass"></i></button>
            <ul id="searchSuggest" class="search-suggest" role="listbox" aria-label="검색 제안"></ul>
        </div>
    </div>
    <button type="button">
        <i class="fa-solid fa-route"></i>
        <p>길찾기</p>
    </button>
</header>

<%@ include file="sidebar.jsp" %>

<button class="side-peek" type="button" aria-label="사이드바 열기">
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

<!-- 우하단 FAB -->
<div class="fab-cluster" aria-label="빠른 실행">
    <button id="btnMyLocation" class="fab" title="내 위치"><i class="fa-solid fa-location-crosshairs"></i></button>
    <button id="fabRefresh"   class="fab" title="새로고침"><i class="fa-solid fa-rotate-right"></i></button>
</div>

<!-- 하단 필터/상태 -->
<div class="bottom-bar" role="region" aria-label="필터 및 상태">
    <div class="chips">
        <button class="chip is-on" data-type="hydrant"   aria-pressed="true">소화전</button>
        <button class="chip"       data-type="tower"     aria-pressed="false">급수탑</button>
        <button class="chip"       data-type="ebox"      aria-pressed="false">비상소화장치</button>
        <button class="chip"       data-type="reservoir" aria-pressed="false">저수조</button>
    </div>
    <span class="status" id="facStatus">화면 내 0개</span>
</div>

<!-- (선택) 바텀시트 -->
<div id="sheet" class="sheet" aria-hidden="true">
    <div class="handle"></div>
    <div class="sheet-content" id="sheetContent"></div>
</div>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
<script type="module" src="${pageContext.request.contextPath}/js/map/app.js?v=20250912"></script>

</body>
</html>
