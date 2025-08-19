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
    <link href="/css/common/style.css" rel="stylesheet" >
    <link href="/css/user/userRegForm.css" rel="stylesheet">

    <!-- jQuery & Kakao API -->
    <script src="/js/jquery-3.7.1.min.js"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>

<div class="full-container">
    <div class="signup-left">
        <!-- 로고 -->
        <div class="logo">
            <img src="/images/logo-daepihasan.png" alt="대피하산 로고">
            <span class="logo-text">대피하산</span>
        </div>

        <div class="w-100" style="max-width:500px;">
            <h2 class="fw-bold mb-4 text-center">회원가입</h2>
            <form id="f">
                <div class="mb-3">
                    <label class="form-label">이름</label>
                    <input type="text" name="userName" id="userName" class="form-control" placeholder="이름을 입력하세요.">
                </div>
                <div class="mb-3">
                    <label class="form-label">아이디</label>
                    <div class="input-group">
                        <input type="text" name="userId" class="form-control" placeholder="아이디를 입력하세요.">
                        <button id="btnUserId" type="button" class="btn btn-primary">중복체크</button>
                    </div>
                    <div id="idRule" class="id-rule"></div>
                </div>

                <div class="mb-3">
                    <label class="form-label">이메일</label>
                    <div class="input-group mb-2">
                        <input type="text" id="emailId" class="form-control" placeholder="이메일을 입력하세요.">
                        <span class="input-group-text">@</span>
                        <select id="emailDomainSelect" class="form-select">
                            <option value="">==선택하세요==</option>
                            <option value="gmail.com">gmail.com</option>
                            <option value="naver.com">naver.com</option>
                            <option value="daum.net">daum.net</option>
                            <option value="kakao.com">kakao.com</option>
                            <option id="inputEmail" value="etc">직접 입력</option>
                        </select>
                        <input type="text" id="emailDomainInput" class="form-control" placeholder="직접 입력" style="display:none;">

                    </div>
                    <input type="hidden" name="email" id="email">
                    <div id="emailRule" class="email-rule"></div>
                    <div class="input-group">
                        <input type="text" name="authNumber" class="form-control" placeholder="인증번호">
                        <button id="btnEmail" type="button" class="btn btn-primary">인증하기</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">비밀번호</label>
                    <input type="password" name="password" id="password" class="form-control" placeholder="비밀번호를 입력하세요.">
                    <div id="pwRule" class="password-rule"></div>
                </div>

                <div class="mb-3">
                    <label class="form-label">비밀번호 확인</label>
                    <input type="password" name="password2" id="password2" class="form-control" placeholder="비밀번호 재입력 해주세요.">
                    <div id="pwMatch" class="password-rule"></div>
                </div>

                <div class="mb-3">
                    <label class="form-label">주소</label>
                    <div class="input-group">
                        <input type="text" name="addr1" class="form-control" placeholder="주소를 입력하세요.">
                        <button id="btnAddr" type="button" class="btn btn-primary">우편번호</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">상세 주소</label>
                    <input type="text" name="addr2" class="form-control" placeholder="상세주소를 입력하세요.">
                </div>
              
                <button id="btnSend" type="button" class="btn btn-primary w-100  mt-3 boxShadow">회원가입</button>
            </form>
        </div>
    </div>

    <div class="signup-right">
        <img src="/images/daepi-inform.jpg" alt="산불발생 긴급대피 요령 배너">
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/user/userRegForm.js"></script>
</body>
</html>
