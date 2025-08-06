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
            min-width: 404px;
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

        /* 날씨 위젯 전체 영역 */
        .weather-widget {
            background: linear-gradient(145deg, #2c3e50, #34495e);
            color: #ecf0f1;
            border-radius: 18px;
            padding: 15px 8px;
            margin: 20px 12px;
            width: 100%;
            max-width: 380px;
            box-sizing: border-box;
        }

        /* 버튼 + 날짜 정렬 */
        .weather-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 0 4px;
            gap: 4px;
        }

        .current-time-display {
            flex-grow: 1;
            color: white;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }


        /* 슬라이드 버튼 */
        .weather-prev-btn,
        .weather-next-btn {
            background: none;
            border: none;
            font-size: 20px;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            padding: 6px;
            border-radius: 50%;
        }

        /* hover 시 색상 및 배경 효과 */
        .weather-prev-btn:hover,
        .weather-next-btn:hover {
            transform: scale(1.3); /* 약간 확대 */
        }

        /* 카드 컨테이너 */
        .weather-cards-container {
            display: flex;
            overflow: hidden;
            width: 100%;
            max-width: 100%;
            padding: 0 4px;
            box-sizing: border-box;
        }

        /* 카드 리스트 */
        .weather-card-list {
            display: flex;
            gap: 12px;
            transition: transform 0.5s ease-in-out;
        }

        /* 카드 아이템 */
        .weather-card-item {
            width: 110px;
            flex-shrink: 0;
            background-color: rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 10px 6px;
            text-align: center;
            font-size: 12px;
            box-sizing: border-box;
        }

        .weather-card-item img {
            width: 32px;
            height: 32px;
            margin: 4px 0;
        }

        .weather-icon-temp {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin: 6px 0;
        }

        .weather-icon-temp img {
            width: 50px;
            height: 50px;
        }

        .temp-text {
            font-size: 16px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); /* 살짝 그림자 */
        }

        /* 반응형 */
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
<%@ include file="/WEB-INF/views/common/header.jsp" %>
<div class="d-flex">
    <%@ include file="/WEB-INF/views/common/sidebar.jsp" %>

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
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
