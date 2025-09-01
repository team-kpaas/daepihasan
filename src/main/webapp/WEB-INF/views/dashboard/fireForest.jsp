<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <title>임야화재 대시보드</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <style>
        body { color:black; margin: 0; background:#e1f0ff; }
        .wrap { max-width: 1280px; margin: 24px auto; padding: 0 16px; }
        .controls { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end; margin-bottom:16px; }
        .control { display:flex; flex-direction:column; gap:6px; }
        .control input, .control select, .control button { padding:8px 10px; border:1px solid #ddd; border-radius:8px; background:#fff; }
        .btn { cursor:pointer; background:#111827; color:#fff; border:0; }
        .grid { display:grid; grid-template-columns: repeat(12, 1fr); gap:16px; }
        .card { background:#fff; border-radius:12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding:16px; }
        .kpi { grid-column: span 3; }
        .kpi h3 { margin:0 0 6px; font-size:14px; color:#6b7280; }
        .kpi .val { font-size:28px; font-weight:700; }
        .kpi .diff { margin-top:8px; font-size:12px; color:#6b7280; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .chart { grid-column: span 12; height: 340px; }
        .muted { color:#6b7280; font-size:12px; }
        .section-title { margin:24px 0 8px; font-weight:700; font-size: 20px}
        .row { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
        .spacer { height: 8px; }
        /* 색상 */
        .diff-up   { color:#dc2626; } /* red-600 */
        .diff-down { color:#2563eb; } /* blue-600 */
        .diff-zero { color:#6b7280; } /* gray-500 */
        .arrow { font-weight:900; }
        .gap8 { display:inline-flex; gap:6px; align-items:center; }
    </style>
</head>
<body>
<%@ include file="../common/header.jsp" %>
<div class="wrap">
    <h1 style="margin:0 0 8px">임야 화재 대시보드</h1>
    <div class="muted">기간과 원인을 바꿔보며 추이를 확인하세요.</div>

    <!-- 컨트롤 -->
    <div class="controls">
        <div class="control">
            <label for="from">시작일</label>
            <input id="from" type="date" />
        </div>
        <div class="control">
            <label for="to">종료일</label>
            <input id="to" type="date" />
        </div>
        <div class="control">
            <label for="codeCd">원인(소분류)</label>
            <select id="codeCd">
                <option value="">전체</option>
            </select>
        </div>
        <div class="control">
            <button class="btn" id="btnApply">적용</button>
        </div>
    </div>

    <!-- KPI -->
    <div class="grid" id="kpiGrid">
        <!-- 발생건수 -->
        <div class="card kpi">
            <h3>발생건수</h3>
            <div class="val" id="kpiCntCur">-</div>
            <div class="diff">
                <span class="muted">전년동기:</span> <span id="kpiCntPrev">-</span>
                <span class="muted">/ 증감</span>
                <span class="gap8">
                    <span id="kpiCntArrow" class="arrow diff-zero">–</span>
                    <span id="kpiCntDiffVal" class="diff-zero">-</span>
                </span>
                (<span id="kpiCntDiffPct" class="diff-zero">-</span>%)
            </div>
        </div>
        <!-- 재산피해 -->
        <div class="card kpi">
            <h3>재산피해</h3>
            <div class="val" id="kpiPropCur">-</div>
            <div class="diff">
                <span class="muted">전년동기:</span> <span id="kpiPropPrev">-</span>
                <span class="muted">/ 증감</span>
                <span class="gap8">
                    <span id="kpiPropArrow" class="arrow diff-zero">–</span>
                    <span id="kpiPropDiffVal" class="diff-zero">-</span>
                </span>
                (<span id="kpiPropDiffPct" class="diff-zero">-</span>%)
            </div>
        </div>
        <!-- 사망자수 -->
        <div class="card kpi">
            <h3>사망자수</h3>
            <div class="val" id="kpiDeathCur">-</div>
            <div class="diff">
                <span class="muted">전년동기:</span> <span id="kpiDeathPrev">-</span>
                <span class="muted">/ 증감</span>
                <span class="gap8">
                    <span id="kpiDeathArrow" class="arrow diff-zero">–</span>
                    <span id="kpiDeathDiffVal" class="diff-zero">-</span>
                </span>
                (<span id="kpiDeathDiffPct" class="diff-zero">-</span>%)
            </div>
        </div>
        <!-- 부상자수 -->
        <div class="card kpi">
            <h3>부상자수</h3>
            <div class="val" id="kpiInjuryCur">-</div>
            <div class="diff">
                <span class="muted">전년동기:</span> <span id="kpiInjuryPrev">-</span>
                <span class="muted">/ 증감</span>
                <span class="gap8">
                    <span id="kpiInjuryArrow" class="arrow diff-zero">–</span>
                    <span id="kpiInjuryDiffVal" class="diff-zero">-</span>
                </span>
                (<span id="kpiInjuryDiffPct" class="diff-zero">-</span>%)
            </div>
        </div>
    </div>

    <div class="section-title">원인(소분류)별 통계</div>
    <div class="row" style="margin-bottom:8px">
        <div class="control">
            <select id="metricBottom">
                <option value="OCRN">발생건수</option>
                <option value="LIFE">인명피해인원수</option>
                <option value="VCTM">사고자인원수</option>
                <option value="INJRDPR">부상자인원수</option>
                <option value="PRPT">재산피해소계금액</option>
            </select>
        </div>
    </div>

    <div id="chartCauses" class="card chart"></div>

    <div class="section-title">월별 추이 (최근 12개월)</div>
    <div id="chartMonthly" class="card chart"></div>
    <div class="spacer"></div>
</div>

<script>
    const $ = (id) => document.getElementById(id);

    // 날짜 기본값
    (function initDates() {
        const today = new Date();
        const toStr = today.toISOString().slice(0,10);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth()-1);
        const fromStr = monthAgo.toISOString().slice(0,10);
        $('from').value = fromStr;
        $('to').value   = toStr;
    })();

    // 차트
    const chartMonthly = echarts.init($('chartMonthly'));
    const chartCauses  = echarts.init($('chartCauses'));
    const nf = new Intl.NumberFormat('ko-KR');

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

    // ▲/▼/색상 렌더 (Arrow/Value/Pct 분리)
    function renderKpi(prefix, cur, prev, diff, pct, isMoney=false) {
        const arrowEl = $('kpi' + prefix + 'Arrow');
        const valEl   = $('kpi' + prefix + 'DiffVal');
        const pctEl   = $('kpi' + prefix + 'DiffPct');
        if (!arrowEl || !valEl || !pctEl) return;

        const nDiff = (diff == null ? NaN : Number(diff));
        const nPct  = (pct  == null ? NaN : Number(pct));

        const sign = Number.isFinite(nPct) ? Math.sign(nPct)
            : (Number.isFinite(nDiff) ? Math.sign(nDiff) : 0);

        let cls='diff-zero', arrow='–';
        if (sign > 0) { cls='diff-up'; arrow='▲'; }
        else if (sign < 0) { cls='diff-down'; arrow='▼'; }

        const absDiffTxt = Number.isFinite(nDiff)
            ? (isMoney ? fmtMoneyShort(Math.abs(nDiff)) : nf.format(Math.abs(nDiff)))
            : '-';
        const absPctTxt = Number.isFinite(nPct) ? Math.abs(nPct) : '-';

        arrowEl.className = 'arrow ' + cls;
        valEl.className   = cls;
        pctEl.className   = cls;

        arrowEl.textContent = arrow;
        valEl.textContent   = absDiffTxt;
        pctEl.textContent   = absPctTxt;
    }

    async function postJSON(url, bodyObj) {
        const res = await fetch(url, {
            method:'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: new URLSearchParams(bodyObj || {})
        });
        return res.json();
    }

    async function loadKPI(from, to) {
        const data = await postJSON('/fireForest/kpi', { from, to });
        if (data.result !== 1) { console.warn('KPI load fail:', data.msg); return; }
        const k = data.data || {};

        const setTxt = (id, v, money=false) => {
            const el = $(id); if (!el) return;
            el.textContent = money ? fmtMoneyShort(v) : nf.format(v ?? 0);
        };
        setTxt('kpiCntCur',   k.cntCur);
        setTxt('kpiCntPrev',  k.cntPrev);
        setTxt('kpiPropCur',  k.propCur,  true);
        setTxt('kpiPropPrev', k.propPrev, true);
        setTxt('kpiDeathCur',  k.deathCur);
        setTxt('kpiDeathPrev', k.deathPrev);
        setTxt('kpiInjuryCur',  k.injuryCur);
        setTxt('kpiInjuryPrev', k.injuryPrev);

        renderKpi('Cnt',    k.cntCur,   k.cntPrev,   k.cntDiff,   k.cntDiffPct,   false);
        renderKpi('Prop',   k.propCur,  k.propPrev,  k.propDiff,  k.propDiffPct,  true);
        renderKpi('Death',  k.deathCur, k.deathPrev, k.deathDiff, k.deathDiffPct, false);
        renderKpi('Injury', k.injuryCur,k.injuryPrev,k.injuryDiff,k.injuryDiffPct,false);
    }

    async function loadMonthly() {
        const data = await postJSON('/fireForest/monthly');
        if (data.result !== 1) { console.warn('Monthly load fail:', data.msg); return; }
        const rows = data.data || [];
        const months = [...new Set(rows.map(r => r.yearMonth))].sort();

        const pick = (key) => months.map(m => (rows.find(x => x.yearMonth === m)?.[key]) || 0);
        const sOCRN = pick('ocrnMnb');
        const sLIFE = pick('lifeDmgPercnt');
        const sVCTM = pick('vctmPercnt');
        const sINJR = pick('injrdprPercnt');
        const sPRPT = pick('prptDmgSbttAmt');

        const maxProp = Math.max(...sPRPT);
        const { div, label } = scaleUnit(maxProp);
        const sPRPTScaled = sPRPT.map(v => Math.round(v / div));

        chartMonthly.setOption({
            tooltip: { trigger:'axis', valueFormatter: v => nf.format(v) },
            legend: { data:['발생건수','인명피해','사고자','부상자', `재산피해(${label})`] },
            grid: { left: 50, right: 50, top: 40, bottom: 40 },
            xAxis: { type:'category', data: months },
            yAxis: [
                { type:'value', name:'건/명' },
                { type:'value', name: label, alignTicks:true }
            ],
            series: [
                { name:'발생건수', type:'line', data: sOCRN, smooth:true, yAxisIndex:0 },
                { name:'인명피해', type:'line', data: sLIFE, smooth:true, yAxisIndex:0 },
                { name:'사고자',   type:'line', data: sVCTM, smooth:true, yAxisIndex:0 },
                { name:'부상자',   type:'line', data: sINJR, smooth:true, yAxisIndex:0 },
                { name:`재산피해(${label})`, type:'bar', data: sPRPTScaled, yAxisIndex:1 }
            ]
        });
    }

    async function loadCauses(from, to, codeCd, metricKey) {
        const data = await postJSON('/fireForest/causes', { from, to, codeCd });
        if (data.result === 0) { alert('날짜 선택이 올바르지 않습니다.'); return; }
        if (data.result === 2) { console.warn('Causes load error'); return; }

        const rows = data.data || [];
        const metricMap = { OCRN:'ocrnMnb', LIFE:'lifeDmgPercnt', VCTM:'vctmPercnt', INJRDPR:'injrdprPercnt', PRPT:'prptDmgSbttAmt' };
        const field = metricMap[metricKey] || 'ocrnMnb';

        const names = rows.map(r => r.wdldSclsfNm);
        const vals  = rows.map(r => r[field] || 0);

        chartCauses.setOption({
            title: { text: '원인(소분류)별 - ' + $('metricBottom').selectedOptions[0].text },
            tooltip: { trigger:'axis', valueFormatter: v => nf.format(v) },
            grid: { left: 120, right: 20, top: 30, bottom: 30 },
            xAxis: { type:'value' },
            yAxis: { type:'category', data: names, inverse:true },
            series: [{ type:'bar', data: vals }]
        });
    }

    async function initLoad() {
        const from = $('from').value;
        const to   = $('to').value;
        const codeCd = $('codeCd').value;
        const metric = $('metricBottom').value;
        await Promise.all([ loadKPI(from, to), loadMonthly(), loadCauses(from, to, codeCd, metric) ]);
    }

    $('btnApply').addEventListener('click', async () => {
        const from = $('from').value;
        const to   = $('to').value;
        const codeCd = $('codeCd').value;
        const metric = $('metricBottom').value;
        await Promise.all([ loadKPI(from, to), loadCauses(from, to, codeCd, metric) ]);
    });

    $('metricBottom').addEventListener('change', async () => {
        const from = $('from').value;
        const to   = $('to').value;
        const codeCd = $('codeCd').value;
        const metric = $('metricBottom').value;
        await loadCauses(from, to, codeCd, metric);
    });

    window.addEventListener('resize', () => {
        chartMonthly.resize();
        chartCauses.resize();
    });

    initLoad();
</script>
</body>
</html>
