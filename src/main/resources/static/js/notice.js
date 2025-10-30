const currentUserId =
    document.querySelector('meta[name="current-user-id"]')?.content?.trim() || '';

(function(){
    const ctx = document.querySelector('meta[name="ctx"]')?.content || '';
    const noticeId = (()=>{
        const m = location.pathname.match(/\/notice\/(\d+)/);
        return m ? m[1] : null;
    })();

    // 좋아요
    const likeBtn = document.getElementById('btn-like');
    if (likeBtn && noticeId){
        likeBtn.addEventListener('click', async ()=>{
            const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
            const url = `${ctx}/notice/${noticeId}/like`;
            const resp = await fetch(url, { method: pressed ? 'DELETE' : 'POST' });
            if (!resp.ok) return alert('잠시 후 다시 시도해주세요.');
            const js = await resp.json();
            likeBtn.setAttribute('aria-pressed', String(js.liked));
            likeBtn.querySelector('i').className = (js.liked ? 'fa-solid' : 'fa-regular') + ' fa-heart me-1';
            document.getElementById('like-count').innerText = js.count ?? 0;
        });
    }

    async function loadComments(){
        if (!noticeId) return;

        // CSRF 헤더 준비 (있으면 자동으로 사용)
        const csrfHeaderName = document.querySelector('meta[name="_csrf_header"]')?.content;
        const csrfToken      = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeaders    = (csrfHeaderName && csrfToken) ? { [csrfHeaderName]: csrfToken } : {};

        const ul    = document.getElementById('comment-list');
        const empty = document.getElementById('comment-empty');
        const resp  = await fetch(`${ctx}/notice/${noticeId}/comments?page=1&size=100`);
        if (!resp.ok) return;

        const list = await resp.json();

        ul.innerHTML = '';
        if (!list || !list.length){
            empty.classList.remove('d-none');
            return;
        }
        empty.classList.add('d-none');

        list.forEach(c=>{
            const li = document.createElement('li');
            li.className = 'comment-item';

            // 작성자만 액션 노출
            const isAuthor = !!currentUserId && !!c.userId && String(c.userId) === String(currentUserId);
            const actionsHtml = isAuthor ? `
          <div class="comment-actions">
            <button class="btn btn-outline-secondary btn-sm" data-edit="${c.id}">수정</button>
            <button class="btn btn-outline-danger btn-sm" data-del="${c.id}">삭제</button>
          </div>
        ` : '';

            li.innerHTML = `
      <div class="d-flex justify-content-between">
        <div class="me-2">
          <div class="fw-semibold">${c.userId ?? '익명'}</div>
          <div class="comment-meta">${c.regDt ?? ''}</div>
        </div>
        ${actionsHtml}
      </div>
      <div class="mt-2" data-contents="${c.id}">${(c.contents ?? '').replace(/\n/g,'<br>')}</div>
    `;
            ul.appendChild(li);
        });

        // 위임 이벤트(수정/삭제)
        // once:true를 쓰면 첫 클릭 이후 리스너가 사라지므로 여기서는 유지형으로 둠
        ul.addEventListener('click', async (ev)=>{
            const del = ev.target.closest('[data-del]');
            if (del){
                const id = del.getAttribute('data-del');
                if(!confirm('댓글을 삭제할까요?')) return;
                const r = await fetch(`${ctx}/notice/${noticeId}/comments/${id}`, {
                    method:'DELETE',
                    headers: { ...csrfHeaders }
                });
                if (r.ok) loadComments();
                return;
            }

            const edit = ev.target.closest('[data-edit]');
            if (edit){
                const id  = edit.getAttribute('data-edit');
                const box = document.querySelector(`[data-contents="${id}"]`);
                const curr = box?.innerText ?? '';
                const next = prompt('댓글 수정', curr);
                if (next == null) return;

                const r = await fetch(`${ctx}/notice/${noticeId}/comments/${id}`, {
                    method:'PUT',
                    headers:{ 'Content-Type':'application/json', ...csrfHeaders },
                    body: JSON.stringify({ contents: next })
                });
                if (r.ok) loadComments();
            }
        }, { passive:true }); // 스크롤 성능용 옵션
    }
    loadComments();

    // 댓글 등록
    const btnC = document.getElementById('btn-comment');
    if (btnC && noticeId){
        btnC.addEventListener('click', async ()=>{
            const ta = document.getElementById('comment-contents');
            const txt = (ta.value||'').trim();
            if (!txt) return ta.focus();
            const r = await fetch(`${ctx}/notice/${noticeId}/comments`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ contents: txt })
            });
            if (r.ok){
                ta.value = '';
                loadComments();
            } else {
                alert('댓글 등록 실패');
            }
        });
    }
})();

(function () {
    const btn = document.getElementById('btnWrite');
    if (!btn) return;

    const IS_AUTH = btn.dataset.auth === 'true';
    const CTX = btn.dataset.ctx || '';

    btn.addEventListener('click', function (e) {
        if (IS_AUTH) return;                // 로그인된 경우: a의 href로 그대로 이동

        // 비로그인: 기본 이동 막고 모달 → 로그인 이동
        e.preventDefault();
        if (typeof window.showModal === 'function') {
            showModal('로그인이 필요한 서비스입니다.', {
                onClose:   () => location.href = CTX + '/user/login',
                onConfirm: () => location.href = CTX + '/user/login'
            });
        } else {
            alert('로그인이 필요한 서비스입니다.');
            location.href = CTX + '/user/login';
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    // ── 제목 ───────────────────────────────────────────────
    const $title    = document.querySelector('input[name="title"]');
    const $titleCnt = document.getElementById('titleCnt');
    const titleMax  = ($title?.getAttribute('maxlength')|0) || 100;

    const updateTitle = () => {
        if (!$title || !$titleCnt) return;
        const len = ($title.value || '').length;
        $titleCnt.textContent = Math.min(len, titleMax);
    };

    if ($title) {
        $title.addEventListener('input', updateTitle);
        $title.addEventListener('change', updateTitle);
        $title.addEventListener('compositionend', updateTitle); // 한글 IME 마감
        updateTitle(); // 초기 표시
    }

    // ── 내용 ───────────────────────────────────────────────
    const $body    = document.querySelector('#contents, textarea[name="contents"]');
    const $bodyCnt = document.getElementById('bodyCnt');
    const bodyMax  = ($body?.getAttribute('maxlength')|0) || 3000;

    const updateBody = () => {
        if (!$body || !$bodyCnt) return;
        const len = ($body.value || '').length;
        $bodyCnt.textContent = Math.min(len, bodyMax);
    };

    if ($body) {
        $body.addEventListener('input', updateBody);
        $body.addEventListener('change', updateBody);
        $body.addEventListener('compositionend', updateBody);
        updateBody();
    }
});