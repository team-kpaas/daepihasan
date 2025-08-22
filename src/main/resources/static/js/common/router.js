// // 메뉴바
// (function () {
//     const $content = document.getElementById('content');
//     const KNOWN_VIEWS = ['home', 'map', 'board'];
//
//     async function loadView(name, push = true) {
//         try {
//             const res = await fetch(`/view/${name}`, { headers: { "X-Requested-With": "fetch" } });
//             if (!res.ok) throw new Error(`loadView 실패: ${res.status}`);
//             const html = await res.text();
//             $content.innerHTML = html;
//
//             // 화면별 후처리
//             if (name === 'map') {
//                 if (typeof initTmap === 'function') initTmap();
//                 else console.error('initTmap가 없습니다. /js/map/map.js 확인!');
//             }
//
//             if (push) history.pushState({ view: name }, '', `/${name}`);
//             setActive(name);
//         } catch (e) {
//             console.error(e);
//             $content.innerHTML = '<div class="p-4 text-danger">화면을 불러오지 못했습니다.</div>';
//         }
//     }
//
//     function setActive(name) {
//         document.querySelectorAll('.js-nav').forEach(a => {
//             a.classList.toggle('active', a.dataset.view === name);
//         });
//     }
//
//     // 메뉴 클릭
//     document.addEventListener('click', (e) => {
//         const a = e.target.closest('.js-nav');
//         if (!a) return;
//         e.preventDefault();
//         loadView(a.dataset.view);
//     });
//
//     // 뒤/앞으로 가기
//     window.addEventListener('popstate', (e) => {
//         const view = (e.state && e.state.view) || 'home';
//         loadView(view, false);
//     });
//
//     // ★ 최초 진입: 경로가 낯설면 map으로 디폴트
//     const lastSeg = location.pathname.split('/').filter(Boolean).pop();
//     const initial = KNOWN_VIEWS.includes(lastSeg) ? lastSeg : 'home';
//     loadView(initial, false);
// })();
