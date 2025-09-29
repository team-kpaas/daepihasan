<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>마이페이지</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    <style>
        body {
            background: #f3f6ff;
        }

        .layout-flex {
            display: flex;
            align-items: flex-start;
        }

        .layout-flex .sidebar-wrapper {
            flex: 0 0 250px;
        }

        .layout-flex main {
            flex: 1;
        }

        .mp-wrap {
            max-width: 820px;
            margin: 0 auto;
            padding: 28px 18px 60px;
            color: #000;
        }

        .mp-card {
            background: #fff;
            border-radius: 14px;
            padding: 22px 24px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, .06);
            margin-bottom: 20px;
        }

        .mp-label {
            font-weight: 600;
            width: 110px;
            flex-shrink: 0;
        }

        .mp-row {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 10px;
        }

        .hidden {
            display: none !important;
        }

        /* 탭 */
        .mp-tabs {
            display: flex;
            gap: 4px;
            border-bottom: 2px solid #e3e8f5;
            margin: 0 0 22px;
            padding: 0;
        }

        .mp-tabs li {
            list-style: none;
        }

        .mp-tab-btn {
            border: none;
            background: transparent;
            padding: 12px 22px;
            font-weight: 600;
            color: #6b7484;
            border-radius: 14px 14px 0 0;
            position: relative;
            transition: .25s;
            cursor: pointer;
        }

        .mp-tab-btn.active {
            color: #1f3c88;
            background: #fff;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, .04), 0 4px 10px -6px rgba(0, 0, 0, .15);
        }

        .mp-tab-btn:not(.active):hover {
            color: #1f3c88;
        }

        .mp-panel {
            display: none;
        }

        .mp-panel.active-panel {
            display: block;
            animation: fadeIn .28s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* 더미 게시글 아이템 */
        #postList .post-item {
            background: #fff;
            border: 1px solid #e5e9f2;
            border-radius: 12px;
            padding: 14px 16px;
        }

        #postList .post-item:hover {
            border-color: #c9d4e6;
            box-shadow: 0 2px 6px rgba(0, 0, 0, .06);
        }

        @media (max-width: 992px) {
            .layout-flex {
                flex-direction: column;
            }

            .sidebar-wrapper {
                width: 100%;
            }
        }

        @media (max-width: 600px) {
            .mp-row {
                flex-direction: column;
                align-items: flex-start;
            }

            .mp-label {
                width: auto;
            }
        }
    </style>
</head>
<body>
<%@ include file="../modal/modal.jsp" %>
<%@ include file="../common/header.jsp" %>
<div class="layout-flex">
    <div class="sidebar-wrapper">
        <%@ include file="../common/sidebar.jsp" %>
    </div>

    <main class="mp-wrap">
        <h1 style="font-size:26px; font-weight:700; margin:0 0 20px;">마이페이지</h1>

        <ul class="mp-tabs" id="mpTabs" role="tablist">
            <li>
                <button type="button" class="mp-tab-btn active" data-panel="panelInfo">내 정보</button>
            </li>
            <li>
                <button type="button" class="mp-tab-btn" data-panel="panelPosts">내 활동</button>
            </li>
        </ul>

        <div id="panelInfo" class="mp-panel active-panel">
            <div class="mp-card" id="infoCard">
                <h3 style="font-size:18px; font-weight:600; margin:0 0 14px;">기본 정보</h3>
                <div class="mp-row"><span class="mp-label">이름</span><span id="fUserName">-</span></div>
                <div class="mp-row"><span class="mp-label">이메일</span><span id="fEmail">-</span></div>

                <div class="mb-3">
                    <h4 class="fw-semibold" style="font-size:16px;">주소</h4>
                    <div id="addrView" class="mb-2">
                        <span id="fAddr">-</span>
                        <button id="btnAddrEdit" class="btn btn-secondary btn-sm ms-2">주소 변경</button>
                    </div>
                    <div id="addrEditBox" class="hidden" style="max-width:420px;">
                        <div class="mb-2">
                            <label class="form-label small mb-1">기본 주소</label>
                            <div class="input-group">
                                <input type="text" id="addr1" class="form-control" readonly placeholder="우편번호 버튼 클릭">
                                <button id="btnFindAddr" type="button" class="btn btn-outline-primary btn-sm">우편번호
                                </button>
                            </div>
                            <div class="invalid-feedback d-block" id="errAddr1" style="display:none;"></div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label small mb-1">상세 주소</label>
                            <input type="text" id="addr2" class="form-control" placeholder="상세 주소">
                            <div class="invalid-feedback" id="errAddr2"></div>
                        </div>
                        <div class="d-flex gap-2">
                            <button id="btnAddrSave" class="btn btn-primary btn-sm flex-fill">저장</button>
                            <button id="btnAddrCancel" class="btn btn-light btn-sm flex-fill">취소</button>
                        </div>
                    </div>
                </div>
                <hr>

                <div>
                    <h4 class="fw-semibold" style="font-size:16px;">비밀번호</h4>
                    <button id="btnPwEdit" class="btn btn-secondary btn-sm mt-1">비밀번호 변경</button>
                    <div id="pwEditBox" class="hidden mt-3" style="max-width:360px;">
                        <div class="mb-2">
                            <label class="form-label small mb-1">현재 비밀번호</label>
                            <input type="password" id="curPw" class="form-control">
                            <div class="invalid-feedback" id="errCurPw"></div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label small mb-1">새 비밀번호</label>
                            <input type="password" id="newPw" class="form-control">
                            <div class="invalid-feedback" id="errNewPw"></div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label small mb-1">새 비밀번호 확인</label>
                            <input type="password" id="newPw2" class="form-control">
                            <div class="invalid-feedback" id="errNewPw2"></div>
                        </div>
                        <div class="small text-muted mb-2">8~20자 / 영문 소문자 + 숫자 + 특수문자(!@#$%^&*())</div>
                        <div class="d-flex gap-2">
                            <button id="btnPwSave" class="btn btn-primary btn-sm flex-fill">변경</button>
                            <button id="btnPwCancel" class="btn btn-light btn-sm flex-fill">취소</button>
                        </div>
                    </div>
                </div>

                <div class="mt-4 text-end">
                    <a href="/user/withdraw" class="text-secondary small">회원 탈퇴 &rsaquo;</a>
                </div>
            </div>
        </div>

        <div id="panelPosts" class="mp-panel">
            <div class="mp-card">
                <h3 style="font-size:18px; font-weight:600; margin:0 0 14px;">내가 작성한 게시글 (더미)</h3>
                <div id="postList" class="list-group small"></div>
                <div id="postEmpty" class="text-muted" style="display:none;">작성한 게시글이 없습니다.</div>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-light btn-sm" id="btnPrev" disabled>이전</button>
                    <button class="btn btn-light btn-sm" id="btnNext" disabled>다음</button>
                </div>
            </div>
        </div>
    </main>
</div>

<script src="/js/common/formValidator.js"></script>
<script>
    // HTML escape (클라이언트 더미 데이터용)
    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    $(function () {
        // ====== 프로필 로드 ======
        loadProfile();

        function loadProfile() {
            $.get("/user/me")
                .done(json => {
                    if (json.result === 1 && json.data) {
                        const u = json.data;
                        $("#fUserName").text(u.userName);
                        $("#fEmail").text(u.email);
                        const addrDisp = [u.addr1, u.addr2].map(v => (v || '').trim()).filter(Boolean).join(' ');
                        $("#fAddr").text(addrDisp || '-');
                        $("#addr1").val(u.addr1 || '');
                        $("#addr2").val(u.addr2 || '');
                    } else {
                        showModal(json.msg || "회원 정보를 불러오지 못했습니다.");
                        if (json.msg && json.msg.indexOf("로그인") > -1) {
                            setTimeout(() => location.href = "/user/login", 800);
                        }
                    }
                })
                .fail(xhr => {
                    if (xhr.status === 401) location.href = "/user/login";
                    else showModal("프로필 조회 실패");
                });
        }

        // ====== 탭 전환 ======
        initTabs();

        function initTabs() {
            const $tabs = $(".mp-tab-btn");
            $tabs.on("click", function () {
                if ($(this).hasClass("active")) return;
                $tabs.removeClass("active");
                $(this).addClass("active");
                $(".mp-panel").removeClass("active-panel");
                $("#" + $(this).data("panel")).addClass("active-panel");
                if ($(this).data("panel") === "panelPosts" && !window.__postsLoaded) {
                    loadDummyPosts(1);
                    window.__postsLoaded = true;
                }
            });
        }

        // ====== 주소 편집 토글 ======
        $("#btnAddrEdit").on("click", () => {
            $("#addrView").addClass("hidden");
            $("#addrEditBox").removeClass("hidden");
        });
        $("#btnAddrCancel").on("click", () => {
            $("#addrEditBox").addClass("hidden");
            $("#addrView").removeClass("hidden");
        });

        // ====== 우편번호 ======
        $("#btnFindAddr").on("click", () => {
            new daum.Postcode({
                oncomplete: function (data) {
                    const full = (data.zonecode ? `(${data.zonecode})` : "") + data.address;
                    $("#addr1").val(full);
                    $("#addr2").focus();
                }
            }).open();
        });

        // ====== 주소 저장 ======
        $("#btnAddrSave").on("click", () => {
            const addr1 = $.trim($("#addr1").val());
            const addr2 = $.trim($("#addr2").val());
            if (!addr1) {
                showModal("기본 주소를 선택하세요.");
                return;
            }

            $.post("/user/me/address", {addr1, addr2})
                .done(json => {
                    if (json.result === 1) {
                        const disp = [addr1, addr2].filter(Boolean).join(' ');
                        $("#fAddr").text(disp || '-');
                        showModal(json.msg || "주소 저장 완료");
                        $("#btnAddrCancel").click();
                    } else {
                        showModal(json.msg || "주소 저장 실패");
                    }
                })
                .fail(xhr => {
                    if (xhr.status === 401) location.href = "/user/login";
                    else showModal("주소 저장 중 오류");
                });
        });

        // ====== 비밀번호 편집 토글 ======
        $("#btnPwEdit").on("click", () => {
            $("#pwEditBox").removeClass("hidden");
        });
        $("#btnPwCancel").on("click", () => {
            clearPwInputs();
            $("#pwEditBox").addClass("hidden");
        });

        // ====== 비밀번호 변경 ======
        const $curPw = $("#curPw");
        const $newPw = $("#newPw");
        const $newPw2 = $("#newPw2");
        const pwRegex = FormValidator?.patterns?.password
            || /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,20}$/;

        function clearPwErrors() {
            ["#errCurPw", "#errNewPw", "#errNewPw2"].forEach(id => $(id).text(""));
            [$curPw, $newPw, $newPw2].forEach($i => $i.removeClass("is-valid is-invalid"));
        }

        function clearPwInputs() {
            $curPw.val("");
            $newPw.val("");
            $newPw2.val("");
            clearPwErrors();
        }

        function validateNew() {
            const v1 = $.trim($newPw.val());
            const v2 = $.trim($newPw2.val());

            if (v1 && pwRegex.test(v1)) {
                $newPw.addClass("is-valid").removeClass("is-invalid");
                $("#errNewPw").text("");
            } else if (v1) {
                $newPw.addClass("is-invalid").removeClass("is-valid");
                $("#errNewPw").text("8~20자, 소문자+숫자+특수문자");
            } else {
                $("#errNewPw").text("");
                $newPw.removeClass("is-valid is-invalid");
            }

            if (v2) {
                if (v1 && v1 === v2 && pwRegex.test(v1)) {
                    $newPw2.addClass("is-valid").removeClass("is-invalid");
                    $("#errNewPw2").text("");
                } else {
                    $newPw2.addClass("is-invalid").removeClass("is-valid");
                    $("#errNewPw2").text("비밀번호가 일치하지 않습니다.");
                }
            } else {
                $("#errNewPw2").text("");
                $newPw2.removeClass("is-valid is-invalid");
            }
        }

        $newPw.on("input", validateNew);
        $newPw2.on("input", validateNew);

        $("#btnPwSave").on("click", () => {
            clearPwErrors();

            const cur = $.trim($curPw.val());
            const n1 = $.trim($newPw.val());
            const n2 = $.trim($newPw2.val());

            let ok = true;
            if (!cur) {
                $("#errCurPw").text("현재 비밀번호 입력");
                ok = false;
            }
            if (!n1) {
                $("#errNewPw").text("새 비밀번호 입력");
                ok = false;
            } else if (!pwRegex.test(n1)) {
                $("#errNewPw").text("형식 불일치");
                ok = false;
            }
            if (!n2) {
                $("#errNewPw2").text("확인 비밀번호 입력");
                ok = false;
            } else if (n1 !== n2) {
                $("#errNewPw2").text("비밀번호 불일치");
                ok = false;
            }
            if (!ok) return;

            $.post("/user/me/password", {currentPw: cur, newPw: n1})
                .done(json => {
                    if (json.result === 1) {
                        showModal(json.msg || "변경 완료");
                        clearPwInputs();
                        $("#pwEditBox").addClass("hidden");
                    } else if (json.result === 5) {
                        $("#errCurPw").text(json.msg || "현재 비밀번호 불일치");
                    } else {
                        showModal(json.msg || "변경 실패");
                    }
                })
                .fail(xhr => {
                    if (xhr.status === 401) location.href = "/user/login";
                    else showModal("비밀번호 변경 중 오류");
                });
        });

        // Enter 이동
        $("#pwEditBox input").on("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const inputs = $("#pwEditBox input:visible");
                const idx = inputs.index(this);
                if (idx < inputs.length - 1) inputs.eq(idx + 1).focus();
                else $("#btnPwSave").click();
            }
        });

// ===== 더미 게시글 데이터 (전역 노출 & Map 구성) =====
        const dummyPosts = Array.from({length: 11}).map((_, i) => {
            const d = new Date(Date.now() - i * 86400000);
            const created = d.toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
            return {
                id: i + 1,
                title: `테스트 게시글 ${i + 1}`,
                createdAt: created,
                views: Math.floor(Math.random() * 150),
                likes: Math.floor(Math.random() * 40),
                content: "샘플 내용입니다. 실제 API 적용 예정."
            };
        });

        function truncate(str, max) {
            if (!str) return "";
            return str.length > max ? str.slice(0, max) + "…" : str;
        }

        /* ===== 목록 렌더 (본문 숨김 + 토글 + 수정) ===== */
        function loadDummyPosts(page) {
            const perPage = 5;
            const total = dummyPosts.length;
            const start = (page - 1) * perPage;
            const slice = dummyPosts.slice(start, start + perPage);
            const $list = $("#postList").empty();

            if (!slice.length) {
                $("#postEmpty").show();
            } else {
                $("#postEmpty").hide();
                slice.forEach(p => {
                    const $item = $('<div class="post-item mb-2" data-id="'+p.id+'">');
                    const $wrap = $('<div class="d-flex justify-content-between align-items-start">').appendTo($item);
                    const $left = $('<div class="flex-grow-1">').appendTo($wrap);

                    $('<div class="fw-semibold mb-1">').text(p.title).appendTo($left);
                    $('<div class="small text-body-secondary mb-1">')
                        .text(truncate(p.content, 60))
                        .appendTo($left);
                    $('<div class="text-muted small">')
                        .text(`작성일: ${p.createdAt} · 조회 ${p.views} · 좋아요 ${p.likes}`)
                        .appendTo($left);

                    $('<div class="post-full mt-2 small border-top pt-2" style="display:none; white-space:pre-wrap;">')
                        .text(p.content)
                        .appendTo($left);

                    // 보기/닫기 토글 버튼
                    $('<button type="button" class="btn btn-outline-secondary btn-sm ms-3" data-action="toggle">')
                        .text('보기')
                        .appendTo($wrap);

                    // 수정하기 버튼 (임시: 모달 안내)
                    $('<button type="button" class="btn btn-outline-primary btn-sm ms-2" data-action="edit">')
                        .text('수정하기')
                        .appendTo($wrap);

                    $list.append($item);
                });
            }
            $("#btnPrev").prop("disabled", page === 1);
            $("#btnNext").prop("disabled", start + perPage >= total);
            window.__postPage = page;
        }

        /* ===== 버튼 이벤트 (토글 + 수정) ===== */
        $(document)
            .off("click", "#postList button[data-action='toggle']")
            .on("click", "#postList button[data-action='toggle']", function(){
                const $btn = $(this);
                const $item = $btn.closest(".post-item");
                const $full = $item.find(".post-full");
                const opened = $full.is(":visible");
                $full.slideToggle(120);
                $btn.text(opened ? "보기" : "닫기");
            })
            .off("click", "#postList button[data-action='edit']")
            .on("click", "#postList button[data-action='edit']", function(){
                const id = $(this).closest(".post-item").data("id");
                showModal("게시판 완성 후 수정 페이지로 이동 예정 (id=" + id + ")");
                // 추후 실제 적용:
                // location.href = "/board/edit/" + id;
            });

        $("#btnPrev").off("click").on("click", () => loadDummyPosts(window.__postPage - 1));
        $("#btnNext").off("click").on("click", () => loadDummyPosts(window.__postPage + 1));

    });
</script>
<script src="/js/common/header.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
