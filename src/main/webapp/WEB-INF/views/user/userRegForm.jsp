<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>회원가입</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="/css/user/userRegForm.css" rel="stylesheet">

    <!-- jQuery & Kakao API -->
    <script src="/js/jquery-3.7.1.min.js"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>

<div class="full-container">
    <!-- 왼쪽 (회원가입 폼) -->
    <div class="signup-left">
        <!-- 로고 (왼쪽 상단 고정) -->
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
        </div>

        <!-- 회원가입 폼 -->
        <div class="w-100" style="max-width:400px;">
            <h2 class="fw-bold mb-4 text-center">회원가입</h2>
            <form id="f">
                <div class="mb-3">
                    <label class="form-label">아이디</label>
                    <div class="input-group">
                        <input type="text" name="userId" class="form-control" placeholder="아이디">
                        <button id="btnUserId" type="button" class="btn btn-outline-secondary">중복체크</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">이메일</label>
                    <!-- 첫 줄: 이메일 + 중복체크 버튼 -->
                    <div class="input-group mb-2">
                        <input type="email" name="email" class="form-control" placeholder="이메일">
                        <button id="btnEmail" type="button" class="btn btn-outline-secondary">중복체크</button>
                    </div>
                    <!-- 둘째 줄: 인증번호 입력 -->
                    <input type="text" name="authNumber" class="form-control" placeholder="인증번호">
                </div>

                <div class="mb-3">
                    <label class="form-label">비밀번호</label>
                    <input type="password" name="password" class="form-control" placeholder="비밀번호">
                </div>
                <div class="mb-3">
                    <label class="form-label">비밀번호 확인</label>
                    <input type="password" name="password2" class="form-control" placeholder="비밀번호 확인">
                </div>

                <div class="mb-3">
                    <label class="form-label">주소</label>
                    <div class="input-group">
                        <input type="text" name="addr1" class="form-control" placeholder="주소">
                        <button id="btnAddr" type="button" class="btn btn-outline-secondary">우편번호</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">상세 주소</label>
                    <input type="text" name="addr2" class="form-control" placeholder="상세주소">
                </div>

                <button id="btnSend" type="button" class="btn btn-primary w-100  mt-3">회원가입</button>
            </form>
        </div>
    </div>

    <!-- 오른쪽 (배너 이미지) -->
    <div class="signup-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령 배너">
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/user/userRegForm.js"></script>
</body>
</html>