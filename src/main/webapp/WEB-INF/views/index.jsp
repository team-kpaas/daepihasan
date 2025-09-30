<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>

<%--    폰트--%>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<%--    부트스트랩--%>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
<%--swiper--%>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

    <%--   css--%>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">

</head>
<body class="home">
<%@ include file="common/header.jsp" %>
<main>
    <!-- Swiper -->
    <div class="swiper mySwiper">
        <div class="swiper-wrapper">
            <div class="swiper-slide">
                <div class="card">
                    <div class="icon blue-gradation">🗺️</div>
                    <h1>지도 탐색</h1>
                    <p>가장 가까운 대피소와 안전한</p>
                    <p>경로를 손쉽게 확인하세요</p>
                    <button class="blue-gradation" id="map-move-button">시작하기</button>
                </div>
            </div>
            <div class="swiper-slide">
                <div class="card">
                    <div class="icon puple-gradation">📝</div>
                    <h1>제보 하기</h1>
                    <p>산불 발생 상황을 빠르게 공유해</p>
                    <p>모두의 안전을 지켜주세요</p>
                    <button class="puple-gradation" id="board-move-button">시작하기</button>
                </div>
            </div>
            <div class="swiper-slide">
                <div class="card">
                    <div class="icon green-gradation">📊</div>
                    <h1>산불 통계</h1>
                    <p>실시간 통계와 과거 데이터를 통해</p>
                    <p>산불 현황을 한눈에 확인하세요</p>
                    <button class="green-gradation" id="stat-move-button">시작하기</button>
                </div>
            </div>
            <div class="swiper-slide">
                <div class="card">
                    <div class="icon yellow-gradation">🔥</div>
                    <h1>산불 위험 예보</h1>
                    <p>오늘의 산불 위험도를 예보로</p>
                    <p>확인하고 미리 대비하세요</p>
                    <button class="yellow-gradation" id="forecast-move-button">시작하기</button>
                </div>
            </div>
        </div>
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
    </div>
</main>
<%--자바스크립트 파일--%>
<%--<script src="/static/js/common/header.js"></script>--%>

</body>
<!-- Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="${pageContext.request.contextPath}/js/common/home.js"></script>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
</html>
