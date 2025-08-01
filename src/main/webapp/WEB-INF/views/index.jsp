<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대피하산</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #e1f0ff;
            margin: 0;
        }

        header {
            background-color: #4da3f9;
            color: white;
            height: 51px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            height: 28px;
            margin-right: 10px;
        }

        .menu-toggle {
            display: none;
            font-size: 20px;
            background: none;
            border: none;
            color: white;
            padding: 6px;
            margin-right: 10px;
        }

        .sidebar {
            background-color: #f8f9fa;
            min-width: 303px;
            padding-top: 20px;
            min-height: calc(100vh - 51px);
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .sidebar .nav-link {
            color: #000;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sidebar .nav-link i {
            color: #2338a0;
        }

        .sidebar .nav-link:hover,
        .sidebar .nav-link:focus {
            background-color: #1e3a8a;
            color: white !important;
        }

        .sidebar .nav-link:hover i,
        .sidebar .nav-link:focus i {
            color: white !important;
        }

        .main-content {
            padding: 20px;
            background-color: #e1f0ff;
        }

        .card {
            border-radius: 10px;
        }

        .weather-card {
            background: linear-gradient(145deg, #2c3e50, #34495e);
            color: #ecf0f1;
            border-radius: 18px;
            padding: 20px 15px;
            margin: 20px 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            font-family: 'Segoe UI', sans-serif;
        }

        .weather-title {
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 14px;
            padding-left: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 5px;
        }

        .weather-days {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        .weather-day {
            flex: 1;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 10px 5px;
            transition: transform 0.2s ease;
        }

        .weather-day:hover {
            transform: scale(1.05);
            background-color: rgba(255, 255, 255, 0.08);
        }

        .weather-date {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .weather-day img {
            width: 38px;
            height: 38px;
            margin: 5px 0;
            filter: drop-shadow(1px 1px 1px #00000050);
        }

        .weather-temp {
            font-size: 12px;
            color: #dfe6e9;
            margin-bottom: 2px;
        }

        .weather-aqi {
            font-size: 11px;
            color: #a4b0be;
        }


        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
            }

            .sidebar {
                position: absolute;
                top: 51px;
                left: 0;
                width: 180px;
                height: auto;
                background-color: #f8f9fa;
                transform: translateX(-100%);
                z-index: 1000;
            }

            .sidebar.show {
                transform: translateX(0);
            }
        }
    </style>
</head>
<body>
<header>
    <div class="d-flex align-items-center">
        <button class="menu-toggle" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i>
        </button>
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="로고">
            <h6 class="mb-0">대피하산</h6>
        </div>
    </div>
    <button class="btn btn-light btn-sm">로그인</button>
</header>

<div class="d-flex">
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
        <div class="weather-card">
            <div class="weather-title">서울 날씨</div>
            <div class="weather-days">
                <div class="weather-day">
                    <div class="weather-date">오늘</div>
                    <img src="/images/weather/sunny.png" alt="sunny" />
                    <div class="weather-temp">15~20°C</div>
                    <div class="weather-aqi">AQI 67</div>
                </div>
                <div class="weather-day">
                    <div class="weather-date">월</div>
                    <img src="/images/weather/cloudy.png" alt="cloudy" />
                    <div class="weather-temp">16~22°C</div>
                    <div class="weather-aqi">AQI 71</div>
                </div>
                <div class="weather-day">
                    <div class="weather-date">화</div>
                    <img src="/images/weather/lightning.png" alt="lightning" />
                    <div class="weather-temp">17~20°C</div>
                    <div class="weather-aqi">AQI 65</div>
                </div>
            </div>
        </div>

    </nav>

    <main class="main-content flex-fill">
        <h4 class="fw-bold mb-4">대시보드</h4>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-white fw-bold">화염 개요</div>
                    <div class="card-body">그래프 또는 통계 자리</div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-white fw-bold">산불 예측</div>
                    <div class="card-body">예측 차트 자리</div>
                </div>
            </div>
        </div>
    </main>
</div>

<script>
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
    }

    // 사이드바 외부 클릭 시 닫기
    document.addEventListener('click', function (event) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.querySelector('.menu-toggle');

        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickToggleBtn = toggleBtn.contains(event.target);

        if (!isClickInsideSidebar && !isClickToggleBtn && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });

    // 화면 크기 조절 시 사이드바 닫기
    window.addEventListener('resize', function () {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
</script>
</body>
</html>
