/* /js/map/search.js */
// /js/map/search.js
import { apiUrl } from './ctx.js';
import { debounce } from './utils.js';

let suggestEl, searchInput, aborter=null, currentItems=[];

export function setupSearchSuggest(tmapMap) {
    searchInput = document.getElementById('mapSearchInput');
    suggestEl   = document.getElementById('searchSuggest');
    if (!searchInput || !suggestEl) return;

    const debounced = debounce(async (q)=>{
        if (q.length < 2) { hideSuggest(); return; }
        await fetchSuggest(q, tmapMap);
    }, 200);

    searchInput.addEventListener('input', e => debounced(e.target.value.trim()));
    searchInput.addEventListener('blur', () => setTimeout(hideSuggest, 120));
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestEl.classList.contains('show')) return;
        if (e.key === 'Enter' && currentItems.length) {
            e.preventDefault(); chooseItem(currentItems[0], tmapMap);
        } else if (e.key === 'Escape') {
            hideSuggest();
        }
    });
}

async function fetchSuggest(q, tmapMap){
    if (aborter) aborter.abort();
    aborter = new AbortController();

    const c = tmapMap?.getCenter();
    const url = `${apiUrl('/api/map/search')}?q=${encodeURIComponent(q)}&count=10&lat=${c?._lat||''}&lon=${c?._lng||''}`;

    try{
        const res = await fetch(url, { signal: aborter.signal });
        if (!res.ok) { hideSuggest(); return; }
        const data = await res.json();
        currentItems = data.items || [];
        renderSuggest(currentItems, tmapMap);
    }catch{ hideSuggest(); }
}

function renderSuggest(items, tmapMap){
    if (!items.length) { hideSuggest(); return; }
    suggestEl.innerHTML = items.map((it,i)=>`
    <li data-idx="${i}">
      <div class="title">${it.name||''}</div>
      <div class="addr">${it.address||''}</div>
    </li>`).join('');
    suggestEl.querySelectorAll('li').forEach(li=>{
        li.addEventListener('mousedown', ()=> chooseItem(items[+li.dataset.idx], tmapMap));
    });
    suggestEl.classList.add('show');     // ← 위치/크기는 CSS가 담당
}

function hideSuggest(){ suggestEl?.classList.remove('show'); }

function chooseItem(it, tmapMap){
    hideSuggest(); if (!it?.lat || !it?.lon) return;
    const pos = new Tmapv3.LatLng(+it.lat, +it.lon);
    tmapMap.setCenter(pos); tmapMap.setZoom(16);
    new Tmapv3.Marker({ map: tmapMap, position: pos, title: it.name || '' });
}
