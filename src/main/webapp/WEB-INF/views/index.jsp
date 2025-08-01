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
            min-width: 180px;
            padding-top: 20px;
            min-height: calc(100vh - 51px);
            transition: transform 0.3s ease-in-out;
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

        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
            }

            .sidebar {
                position: absolute;
                top: 51px;
                left: 0;
                width: 180px;
                height: 100vh;
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
    </nav>

    <main class="main-content flex-fill">
        <h4 class="fw-bold mb-4">대시보드</h4>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-white fw-bold">화염 개요</div>
                    <div class="card-body">
                        그래프 또는 통계 자리
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-white fw-bold">산불 예측</div>
                    <div class="card-body">
                        예측 차트 자리
                    </div>
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
</script>
</body>
</html>
