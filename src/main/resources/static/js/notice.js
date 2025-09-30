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

    // 댓글 목록 로드
    async function loadComments(){
        if (!noticeId) return;
        const ul = document.getElementById('comment-list');
        const empty = document.getElementById('comment-empty');
        const resp = await fetch(`${ctx}/notice/${noticeId}/comments?page=1&size=100`);
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
            li.innerHTML = `
        <div class="d-flex justify-content-between">
          <div class="me-2">
            <div class="fw-semibold">${c.userId ?? '익명'}</div>
            <div class="comment-meta">${c.regDt ?? ''}</div>
          </div>
          <div class="comment-actions">
            <button class="btn btn-outline-secondary btn-sm" data-edit="${c.id}">수정</button>
            <button class="btn btn-outline-danger btn-sm" data-del="${c.id}">삭제</button>
          </div>
        </div>
        <div class="mt-2" data-contents="${c.id}">${(c.contents ?? '').replace(/\n/g,'<br>')}</div>
      `;
            ul.appendChild(li);
        });

        // 삭제
        ul.addEventListener('click', async (ev)=>{
            const del = ev.target.closest('[data-del]');
            if (del){
                const id = del.getAttribute('data-del');
                if(!confirm('댓글을 삭제할까요?')) return;
                const r = await fetch(`${ctx}/notice/${noticeId}/comments/${id}`, { method:'DELETE' });
                if (r.ok) loadComments();
            }
            const edit = ev.target.closest('[data-edit]');
            if (edit){
                const id = edit.getAttribute('data-edit');
                const box = document.querySelector(`[data-contents="${id}"]`);
                const curr = box.innerText;
                const next = prompt('댓글 수정', curr);
                if (next == null) return;
                const r = await fetch(`${ctx}/notice/${noticeId}/comments/${id}`, {
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ contents: next })
                });
                if (r.ok) loadComments();
            }
        }, { once:true }); // 최초 1회 바인딩
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