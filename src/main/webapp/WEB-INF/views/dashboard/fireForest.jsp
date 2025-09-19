<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <title>임야화재 대시보드</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">
    <style>
        #ffPage { background:#f3f6ff; color:#111; }
        #ffPage .ff-wrap { max-width:1280px; margin:0 auto; padding:24px 16px; }
        #ffPage .ff-controls { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end; margin-bottom:16px; }
        #ffPage .ff-control { display:flex; flex-direction:column; gap:6px; }
        #ffPage .ff-control input, #ffPage .ff-control select { padding:8px 10px; border:1px solid #ddd; border-radius:8px; background:#fff; }
        #ffPage .ff-row { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
        #ffPage .ff-grid { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; }
        #ffPage .ff-card { background:#fff; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,.06); padding:16px; }
        #ffPage .ff-kpi { grid-column:span 3; }
        #ffPage .ff-kpi h3 { margin:0 0 6px; font-size:14px; color:#6b7280; }
        #ffPage .ff-kpi .ff-val { font-size:28px; font-weight:700; }
        #ffPage .ff-kpi .ff-diff { margin-top:8px; font-size:12px; color:#6b7280; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        #ffPage .ff-chart { grid-column:span 12; height:340px; }
        #ffPage .ff-muted { color:#6b7280; font-size:12px; }
        #ffPage .ff-section-title { margin:24px 0 8px; font-weight:700; font-size:20px; }
        #ffPage .ff-spacer { height:8px; }
        #ffPage .ff-up{color:#dc2626;} #ffPage .ff-down{color:#2563eb;} #ffPage .ff-zero{color:#6b7280;}
        #ffPage .ff-arrow{font-weight:900;} #ffPage .ff-gap8{display:inline-flex; gap:6px; align-items:center;}
        #ffPage .ff-label { font-size:12px; color:#6b7280; margin-bottom:6px; }

        @media (max-width: 992px) {
            #ffPage .ff-grid { grid-template-columns:repeat(1, 1fr); }
            #ffPage .ff-kpi { grid-column:span 1; }
            #ffPage .ff-chart { height:280px; }
            #ffPage .ff-controls { flex-direction:column; align-items:flex-start; }
        }
    </style>
</head>
<body>
<%@ include file="../common/header.jsp" %>
<div class="app-body d-flex">
    <%@ include file="../common/sidebar.jsp" %>
    <main id="content" class="main-content flex-fill">
        <div id="ffPage">
            <div class="ff-wrap">
                <h1 style="margin:0 0 8px">임야 화재 대시보드</h1>
                <div class="ff-muted">기간을 바꾸면 전동기 차트가 즉시 갱신됩니다.</div>

                <div class="ff-controls">
                    <div class="ff-control">
                        <label for="from" class="ff-label">시작일</label>
                        <input id="from" type="date" />
                    </div>
                    <div class="ff-control">
                        <label for="to" class="ff-label">종료일</label>
                        <input id="to" type="date" />
                    </div>
                </div>

                <!-- KPI -->
                <div class="ff-grid" id="kpiGrid">
                    <div class="ff-card ff-kpi"><h3>발생건수</h3><div class="ff-val" id="kpiCntCur">-</div>
                        <div class="ff-diff"><span class="ff-muted">전동기:</span> <span id="kpiCntPrev">-</span>
                            <span class="ff-muted">/ 증감</span>
                            <span class="ff-gap8"><span id="kpiCntArrow" class="ff-arrow ff-zero">–</span><span id="kpiCntDiffVal" class="ff-zero">-</span></span>
                            (<span id="kpiCntDiffPct" class="ff-zero">-</span>%)</div>
                    </div>
                    <div class="ff-card ff-kpi"><h3>재산피해</h3><div class="ff-val" id="kpiPropCur">-</div>
                        <div class="ff-diff"><span class="ff-muted">전동기:</span> <span id="kpiPropPrev">-</span>
                            <span class="ff-muted">/ 증감</span>
                            <span class="ff-gap8"><span id="kpiPropArrow" class="ff-arrow ff-zero">–</span><span id="kpiPropDiffVal" class="ff-zero">-</span></span>
                            (<span id="kpiPropDiffPct" class="ff-zero">-</span>%)</div>
                    </div>
                    <div class="ff-card ff-kpi"><h3>사망자수</h3><div class="ff-val" id="kpiDeathCur">-</div>
                        <div class="ff-diff"><span class="ff-muted">전동기:</span> <span id="kpiDeathPrev">-</span>
                            <span class="ff-muted">/ 증감</span>
                            <span class="ff-gap8"><span id="kpiDeathArrow" class="ff-arrow ff-zero">–</span><span id="kpiDeathDiffVal" class="ff-zero">-</span></span>
                            (<span id="kpiDeathDiffPct" class="ff-zero">-</span>%)</div>
                    </div>
                    <div class="ff-card ff-kpi"><h3>부상자수</h3><div class="ff-val" id="kpiInjuryCur">-</div>
                        <div class="ff-diff"><span class="ff-muted">전동기:</span> <span id="kpiInjuryPrev">-</span>
                            <span class="ff-muted">/ 증감</span>
                            <span class="ff-gap8"><span id="kpiInjuryArrow" class="ff-arrow ff-zero">–</span><span id="kpiInjuryDiffVal" class="ff-zero">-</span></span>
                            (<span id="kpiInjuryDiffPct" class="ff-zero">-</span>%)</div>
                    </div>
                </div>

                <!-- 임야별 -->
                <div class="ff-section-title">임야별 통계</div>
                <div class="ff-row" style="margin-bottom:8px">
                    <div class="ff-control">
                        <span class="ff-label">임야 분류</span>
                        <select id="codeCd">
                            <option value="">전체</option>
                        </select>
                    </div>
                    <div class="ff-control">
                        <span class="ff-label">지표</span>
                        <select id="metricBottom">
                            <option value="OCRN">발생건수</option>
                            <option value="LIFE">인명피해인원수</option>
                            <option value="VCTM">사고자인원수</option>
                            <option value="INJRDPR">부상자인원수</option>
                            <option value="PRPT">재산피해소계금액</option>
                        </select>
                    </div>
                </div>
                <div id="chartCauses" class="ff-card ff-chart"></div>

                <!-- 월별 -->
                <div class="ff-section-title">월별 추이 (최근 12개월)</div>
                <div id="chartMonthly" class="ff-card ff-chart"></div>
                <div class="ff-spacer"></div>
            </div>
        </div>
    </main>
</div>
<script>
    const ff$ = (id) => document.getElementById(id);
    const chartMonthly = echarts.init(ff$('chartMonthly'));
    const chartCauses  = echarts.init(ff$('chartCauses'));
    const nf = new Intl.NumberFormat('ko-KR');
    const cache = { causes: [], monthly: [] };

    // === 색상 팔레트/유틸 ===
    const COLORS = {
        occ : '#7CCF5B',     // 발생건수(라인) - 연두
        life: '#4B7BE5',     // 인명피해(라인) - 파랑
        vctm: '#F39C12',     // 사고자(라인) - 오렌지
        inj : '#F2C94C',     // 부상자(라인) - 노랑
        propLegend: '#7AA7FF'// 재산피해(막대) 범례 대표색(중간 파랑)
    };
    const BLUE_GRADIENT = ['#D8E5FF','#7AA7FF','#2F64FF']; // 막대 저→중→고

    function hexToRgb(h){ const x=parseInt(h.slice(1),16); return [x>>16&255,x>>8&255,x&255]; }
    function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
    const lerp=(a,b,t)=>a+(b-a)*t;
    function lerpColor(c1,c2,t){ const [r1,g1,b1]=hexToRgb(c1),[r2,g2,b2]=hexToRgb(c2);
        return rgbToHex(Math.round(lerp(r1,r2,t)),Math.round(lerp(g1,g2,t)),Math.round(lerp(b1,b2,t))); }
    function blueByValue(v,min,max){
        if(!isFinite(v)||max<=min) return BLUE_GRADIENT[1];
        const t=(v-min)/(max-min);
        return t<=0.5 ? lerpColor(BLUE_GRADIENT[0],BLUE_GRADIENT[1],t*2)
            : lerpColor(BLUE_GRADIENT[1],BLUE_GRADIENT[2],(t-0.5)*2);
    }

    (function initDates() {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        const todayStr = today.toISOString().slice(0,10);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth()-1);
        const fromStr = monthAgo.toISOString().slice(0,10);
        ff$('from').value = fromStr; ff$('to').value = todayStr;
        ff$('from').setAttribute('min','2015-01-01'); ff$('from').setAttribute('max',todayStr);
        ff$('to').setAttribute('min','2015-01-01');   ff$('to').setAttribute('max',todayStr);
    })();

    // 금액 축 단위
    function scaleUnit(max) {
        if (!isFinite(max) || max <= 0) return { div: 1, label: '원' };
        if (max >= 1e9) return { div: 1e8, label: '억 원' };
        if (max >= 1e6) return { div: 1e6, label: '백만 원' };
        return { div: 1, label: '원' };
    }
    function fmtMoneyShort(v) {
        if (v == null) return '-';
        if (v >= 1e9) return nf.format(Math.round(v/1e8)) + '억 원';
        if (v >= 1e6) return nf.format(Math.round(v/1e6)) + '백만 원';
        return nf.format(v) + ' 원';
    }

    function renderKpi(prefix, diff, pct, isMoney=false) {
        const arrowEl = ff$('kpi'+prefix+'Arrow');
        const valEl   = ff$('kpi'+prefix+'DiffVal');
        const pctEl   = ff$('kpi'+prefix+'DiffPct');
        if (!arrowEl || !valEl || !pctEl) return;
        const nDiff = diff == null ? NaN : Number(diff);
        const nPct  = pct  == null ? NaN : Number(pct);
        const sign = Number.isFinite(nPct) ? Math.sign(nPct)
            : (Number.isFinite(nDiff) ? Math.sign(nDiff) : 0);
        let cls='ff-zero', arrow='–';
        if (sign > 0) { cls='ff-up'; arrow='▲'; }
        else if (sign < 0) { cls='ff-down'; arrow='▼'; }
        const absDiffTxt = Number.isFinite(nDiff)
            ? (isMoney ? fmtMoneyShort(Math.abs(nDiff)) : nf.format(Math.abs(nDiff))) : '-';
        const absPctTxt  = Number.isFinite(nPct) ? Math.abs(nPct) : '-';
        arrowEl.className='ff-arrow '+cls; valEl.className=cls; pctEl.className=cls;
        arrowEl.textContent=arrow; valEl.textContent=absDiffTxt; pctEl.textContent=absPctTxt;
    }
    function setText(id, v, money=false) { const el=ff$(id); if(!el) return; el.textContent = money ? fmtMoneyShort(v) : nf.format(v ?? 0); }
    function renderKpiFromObject(k) {
        setText('kpiCntCur',k.cntCur); setText('kpiCntPrev',k.cntPrev);
        setText('kpiPropCur',k.propCur,true); setText('kpiPropPrev',k.propPrev,true);
        setText('kpiDeathCur',k.deathCur); setText('kpiDeathPrev',k.deathPrev);
        setText('kpiInjuryCur',k.injuryCur); setText('kpiInjuryPrev',k.injuryPrev);
        renderKpi('Cnt',k.cntDiff,k.cntDiffPct,false);
        renderKpi('Prop',k.propDiff,k.propDiffPct,true);
        renderKpi('Death',k.deathDiff,k.deathDiffPct,false);
        renderKpi('Injury',k.injuryDiff,k.injuryDiffPct,false);
    }

    function renderMonthlyFromArray(rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            chartMonthly.setOption({ title:{text:'월별 추이 (데이터 없음)'}, xAxis:{ type:'category', data:[] }, yAxis:[{type:'value'},{type:'value'}], series:[] });
            return;
        }

        const months = [...new Set(rows.map(r => r.yearMonth))].sort();
        const pick = (key) => months.map(m => (rows.find(x => x.yearMonth === m)?.[key]) || 0);

        const sOCRN = pick('ocrnMnb');          // 발생건수(라인)
        const sLIFE = pick('lifeDmgPercnt');    // 인명피해(라인)
        const sVCTM = pick('vctmPercnt');       // 사고자(라인)
        const sINJR = pick('injrdprPercnt');    // 부상자(라인)
        const sPRPT = pick('prptDmgSbttAmt');   // 재산피해(막대)

        const maxProp = Math.max(...sPRPT);
        const { div, label } = scaleUnit(maxProp);
        const sPRPTScaled = sPRPT.map(v => Math.round(v / div));
        const minProp = Math.min(...sPRPTScaled), maxPropScaled = Math.max(...sPRPTScaled);

        chartMonthly.setOption({
            tooltip: { trigger: 'axis', valueFormatter: v => nf.format(v) },
            legend: { data: ['발생건수','인명피해','사고자','부상자','재산피해('+label+')'] },
            grid: { left: 50, right: 50, top: 80, bottom: 20 },
            xAxis: { type: 'category', data: months },
            yAxis: [
                { type: 'value', name: '건/명' },
                { type: 'value', name: label, alignTicks: true }
            ],
            series: [
                { name:'발생건수', type:'line', data:sOCRN, smooth:true, yAxisIndex:0,
                    lineStyle:{color:COLORS.occ}, itemStyle:{color:COLORS.occ} },
                { name:'인명피해', type:'line', data:sLIFE, smooth:true, yAxisIndex:0,
                    lineStyle:{color:COLORS.life}, itemStyle:{color:COLORS.life} },
                { name:'사고자',   type:'line', data:sVCTM, smooth:true, yAxisIndex:0,
                    lineStyle:{color:COLORS.vctm}, itemStyle:{color:COLORS.vctm} },
                { name:'부상자',   type:'line', data:sINJR, smooth:true, yAxisIndex:0,
                    lineStyle:{color:COLORS.inj}, itemStyle:{color:COLORS.inj} },
                { name:'재산피해('+label+')', type:'bar', yAxisIndex:1,
                    // 범례 색 고정(대표색) + 데이터별 파랑그라데이션
                    color: COLORS.propLegend,
                    data: sPRPTScaled.map(v => ({ value:v, itemStyle:{ color: blueByValue(v, minProp, maxPropScaled) } }))
                }
            ]
        });
    }

    function renderCausesFromArray(rows, metricKey) {
        const metricMap = { OCRN:'ocrnMnb', LIFE:'lifeDmgPercnt', VCTM:'vctmPercnt', INJRDPR:'injrdprPercnt', PRPT:'prptDmgSbttAmt' };
        const field = metricMap[metricKey] || 'ocrnMnb';
        if (!Array.isArray(rows) || rows.length === 0) {
            chartCauses.setOption({ title:{text:'임야별 - (데이터 없음)'}, xAxis:{type:'value'}, yAxis:{type:'category',data:[]}, series:[{type:'bar',data:[]}] });
            return;
        }
        const metricLabel = ff$('metricBottom')?.selectedOptions?.[0]?.text || '지표';
        const names = rows.map(r => r.wdldSclsfNm ?? '');
        const vals  = rows.map(r => r?.[field] ?? 0);
        const minV = Math.min(...vals), maxV = Math.max(...vals);

        chartCauses.setOption({
            title: { text: '임야별 - ' + metricLabel },
            tooltip: { trigger:'axis', valueFormatter: v => nf.format(v) },
            grid: { left: 70, right: 20, top: 30, bottom: 30 },
            xAxis: { type:'value' },
            yAxis: { type:'category', data: names, inverse:true },
            series: [{ type:'bar', data: vals.map(v => ({ value:v, itemStyle:{ color: blueByValue(v, minV, maxV) } })) }]
        });
    }

    function renderCausesUsingCache(shouldAlert=false) {
        const codeCd = ff$('codeCd')?.value || '';
        const metric = ff$('metricBottom')?.value || 'OCRN';
        const rows = codeCd ? (cache.causes || []).filter(r => r.wdldSclsfCd === codeCd) : (cache.causes || []);
        if (!rows.length) {
            if (shouldAlert) alert('해당 임야의 화재 정보가 없습니다.');
            chartCauses.setOption({
                title: { text: '임야별 - ' + (ff$('metricBottom')?.selectedOptions?.[0]?.text || '지표') },
                xAxis: { type:'value' }, yAxis: { type:'category', data: [] }, series: [{ type:'bar', data: [] }]
            });
            return;
        }
        renderCausesFromArray(rows, metric);
    }

    async function postJSON(url, bodyObj) {
        const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8' }, body:new URLSearchParams(bodyObj||{}) });
        return res.json();
    }

    // 초기 로드
    async function loadDashboard() {
        const res = await fetch('/fireForest/dashboard');
        const data = await res.json();
        renderKpiFromObject(data.kpi || {});
        const sel = ff$('codeCd'); sel.length = 1;
        (data.codeList || []).forEach(c => { const opt=document.createElement('option'); opt.value=c.codeCd; opt.text=c.codeNm; sel.appendChild(opt); });
        cache.causes  = data.causeList   || [];
        cache.monthly = data.monthlyList || [];
        renderCausesUsingCache(false);
        renderMonthlyFromArray(cache.monthly);
    }

    async function refreshOnDateChange() {
        const codeSel = ff$('codeCd'); codeSel.value = '';
        const todayStr = new Date().toISOString().slice(0,10);
        if (ff$('to').value > todayStr) ff$('to').value = todayStr;
        if (ff$('from').value > ff$('to').value) ff$('from').value = ff$('to').value;
        const from = ff$('from').value, to = ff$('to').value;

        const [kpiRes, causesRes] = await Promise.all([
            postJSON('/fireForest/kpi',    { from, to }),
            postJSON('/fireForest/causes', { from, to })
        ]);
        if (kpiRes?.result === 1) renderKpiFromObject(kpiRes.data || {});
        if (causesRes?.result === 1) { cache.causes = causesRes.data || []; renderCausesUsingCache(false); }
    }

    const ffDebounce = (fn, ms=80) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms);} };
    ff$('from').addEventListener('change', ffDebounce(refreshOnDateChange, 80));
    ff$('to').addEventListener('change',   ffDebounce(refreshOnDateChange, 80));
    ff$('to').addEventListener('input', () => { const todayStr = new Date().toISOString().slice(0,10); if (ff$('to').value > todayStr) ff$('to').value = todayStr; });
    ff$('codeCd').addEventListener('change', () => renderCausesUsingCache(true));
    ff$('metricBottom').addEventListener('change', () => renderCausesUsingCache(false));
    window.addEventListener('resize', () => { chartMonthly.resize(); chartCauses.resize(); });

    loadDashboard();
</script>
<script src="/js/common/header.js"></script>
<script src="/js/common/location.js"></script>
<script src="/js/common/sidebar.js"></script>
<script src="/js/common/weather.js"></script>
</body>
</html>
