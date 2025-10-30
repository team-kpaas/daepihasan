<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String path = request.getRequestURI();
    boolean isFireDash = path.startsWith("/dashboard/forestFireCase");    // 산불 대시보드
    boolean isForestDash = path.startsWith("/dashboard/fireForest"); // 임야 화재 대시보드 (예: URL 맞춰서 수정)
%>

<nav class="sidebar" id="sidebar">
    <div>
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link <%= path.equals("/") ? "active" : "" %> js-nav" href="/" data-view="home">
                    <i class="fa-solid fa-house"></i> 홈
                </a>
            </li>

            <li class="nav-item">
                <a class="nav-link js-nav <%= path.startsWith("/view/map") ? "active" : "" %>" href="/view/map" data-view="map">
                    <i class="fa-solid fa-map"></i> 지도
                </a>
            </li>

            <li class="nav-item">
                <a class="nav-link <%= path.startsWith("/notice") ? "active" : "" %>" href="/notice">
                    <i class="fa-solid fa-bullhorn"></i> 제보 게시판
                </a>
            </li>

            <li class="nav-item has-submenu">
                <!-- parent: 클릭 시 산불 대시보드로 이동. 모바일에서는 첫 탭에 펼치기 -->
                <a class="nav-link submenu-toggle <%= (isFireDash || isForestDash) ? "active" : "" %>"
                   href="/dashboard/forestFireCase" data-default-go="/dashboard/forestFireCase" aria-expanded="false">
                    <i class="fa-solid fa-chart-line"></i> 산불 통계
                    <i class="fa-solid fa-chevron-down submenu-caret" aria-hidden="true"></i>
                </a>

                <ul class="submenu" role="menu" aria-label="산불 통계 하위">
                    <li>
                        <a class="nav-link <%= isFireDash ? "active" : "" %>" href="/dashboard/forestFireCase">
                            <i class="fa-solid fa-gauge-simple"></i> 산불 대시보드
                        </a>
                    </li>
                    <li>
                        <a class="nav-link <%= isForestDash ? "active" : "" %>" href="/dashboard/fireForest">
                            <i class="fa-solid fa-tree"></i> 임야 화재 대시보드
                        </a>
                    </li>
                </ul>
            </li>

            <li class="nav-item">
                <a class="nav-link <%= path.startsWith("/forecast") ? "active" : "" %>" href="/forecast">
                    <i class="fa-solid fa-fire-flame-simple"></i> 산불 위험 예보
                </a>
            </li>
        </ul>
    </div>

    <!-- 날씨 위젯 영역 (기존 그대로) -->
    <div class="weather-widget">
        <div class="weather-header-row">
            <button class="weather-prev-btn" id="prevBtn"><i class="fas fa-chevron-left"></i></button>
            <div class="weather-header" id="weather-date-label"></div>
            <div id="current-time" class="current-time-display"></div>
            <button class="weather-next-btn" id="nextBtn"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="weather-cards-container">
            <div class="weather-card-list" id="weatherSlider"></div>
        </div>
    </div>
</nav>
