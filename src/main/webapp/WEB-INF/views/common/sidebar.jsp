<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<nav class="sidebar" id="sidebar">
    <div>
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" href="#">
                    <i class="fa-solid fa-house" style="color: #2338a0;"></i> 홈
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="fa-solid fa-map" style="color: #2338a0;"></i> 지도
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="fa-solid fa-bullhorn" style="color: #2338a0;"></i> 제보 게시판
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="fa-solid fa-chart-line" style="color: #2338a0;"></i> 산불 통계
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="fa-solid fa-fire-flame-simple" style="color: #2338a0;"></i> 산불 위험 예보
                </a>
            </li>
        </ul>
    </div>

    <!-- 날씨 위젯 영역 -->
    <div class="weather-widget">
        <!-- 버튼과 날짜를 가로 정렬 -->
        <div class="weather-header-row">
            <!-- 이전 버튼 -->
            <button class="weather-prev-btn" id="prevBtn">
                <i class="fas fa-chevron-left"></i>
            </button>

            <div class="weather-header" id="weather-date-label"></div>
            <div id="current-time" class="current-time-display"></div>


            <!-- 다음 버튼 -->
            <button class="weather-next-btn" id="nextBtn">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <div class="weather-cards-container">
            <div class="weather-card-list" id="weatherSlider">
                <!-- 카드들이 들어오는 영역 -->
            </div>
        </div>
    </div>


</nav>