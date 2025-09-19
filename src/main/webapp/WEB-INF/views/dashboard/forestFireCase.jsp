<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <title>산불 대시보드</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="${pageContext.request.contextPath}/js/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/header.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/sidebar.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/common/weather.css">

    <style>
        :root{
            --card-h:420px;      /* 큰 차트 높이 */
            --card-h-sm:360px;   /* 중간 차트 높이 */
            --gap:16px;
        }
        #ffcPage{ background:#f3f6ff; color:#111; }
        #ffcPage .wrap{ max-width:1280px; margin:0 auto; padding:24px 16px; }
        #ffcPage .muted{ color:#6b7280; font-size:12px; }
        #ffcPage .grid{ display:grid; grid-template-columns:repeat(12,1fr); gap:var(--gap); }
        #ffcPage .card{ background:#fff; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,.06); padding:16px; }
        #ffcPage .section-title{ margin:24px 0 8px; font-weight:700; font-size:20px; }
        /* 크기 프리셋 */
        #ffcPage .full{ grid-column:span 12; height:var(--card-h); }
        #ffcPage .half{ grid-column:span 6; height:var(--card-h); }
        #ffcPage .half-sm{ grid-column:span 6; height:var(--card-h-sm); }
        /* KPI */
        #ffcPage .kpi-grid .kpi{ grid-column:span 3; }
        #ffcPage .kpi h3{ margin:0 0 6px; font-size:14px; color:#6b7280; }
        #ffcPage .kpi .val{ font-size:28px; font-weight:700; }
        /* 드롭다운 */
        #ffcPage .controls{ display:flex; gap:12px; margin:0 0 12px; }
        #ffcPage select{ padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }

        /* (중요) flex 자식이 가로로 충분히 줄어들 수 있게 */
        .main-content{ min-width:0; }

        /* 반응형 */
        @media (max-width: 992px){
            #ffcPage .half, #ffcPage .half-sm{ grid-column:span 12; height:var(--card-h-sm); }
            #ffcPage .kpi-grid .kpi { grid-column:span 6; } /* 2열 */
        }
        @media (max-width: 576px) {
            #ffcPage .kpi-grid .kpi { grid-column:span 12; } /* 모바일 1열 */
            #ffcPage .full, #ffcPage .half, #ffcPage .half-sm { grid-column:span 12; height:280px; }
            #ffcPage .controls { flex-direction:column; align-items:flex-start; }
        }
    </style>
</head>
<body>
<%@ include file="../common/header.jsp" %>
<div class="app-body d-flex">
    <%@ include file="../common/sidebar.jsp" %>
    <main id="content" class="main-content flex-fill">
        <div id="ffcPage">
            <div class="wrap">
                <h1 style="margin:0 0 8px">산불 대시보드</h1>
                <div class="muted">처음엔 전국 기준으로 표시됩니다. 시·도를 선택하면 해당 지역 기준으로 갱신됩니다.</div>

                <!-- 시·도 선택 -->
                <div class="controls">
                    <div>
                        <label for="provinceSel" class="muted">시·도 선택</label><br/>
                        <select id="provinceSel">
                            <option value="">전국</option>
                            <c:forEach var="r" items="${regions}">
                                <c:if test="${r.regionCD ne '00'}">
                                    <option value="${r.regionCD}">${r.regionNm}</option>
                                </c:if>
                            </c:forEach>
                        </select>
                    </div>
                </div>

                <!-- KPI -->
                <div class="grid kpi-grid">
                    <div class="card kpi">
                        <h3>누적 발생건수</h3><div class="val" id="kpiTotalCnt">-</div>
                    </div>
                    <div class="card kpi">
                        <h3>누적 피해면적</h3><div class="val" id="kpiTotalArea">-</div>
                        <div class="muted">단위: ha</div>
                    </div>
                    <div class="card kpi">
                        <h3>평균 진화시간</h3><div class="val" id="kpiAvgDur">-</div>
                        <div class="muted">단위: 시간/분 표시</div>
                    </div>
                    <div class="card kpi">
                        <h3>현재 필터</h3><div class="val" id="kpiFilterText">전국</div>
                    </div>
                </div>

                <!-- 최근 12개월 -->
                <div class="section-title">최근 12개월 추이</div>
                <div id="chartLast12" class="card full"></div>

                <!-- 연도 통계 -->
                <div class="section-title">연도 통계</div>
                <div id="chartYearly" class="card full"></div>

                <!-- 월 통계 -->
                <div class="section-title">월 통계</div>
                <div id="chartMonthly" class="card half-sm"></div>

                <!-- 계절/원인 나란히 -->
                <div class="section-title">계절별 / 원인 TOP</div>
                <div class="grid">
                    <div id="chartSeasonal" class="card half-sm"></div>
                    <div id="chartCause" class="card half-sm"></div>
                </div>

                <!-- 전국 지역별(전국 고정) -->
                <div class="section-title">전 지역(시·도)별 발생건수 (전국 기준)</div>
                <div id="chartProvince" class="card full"></div>
            </div>
        </div>
    </main>
</div>

<script>
    /* ===== 서버 모델 하이드레이션 ===== */
    const REGION_MAP = {
        <c:forEach var="r" items="${regions}" varStatus="s">
        "${r.regionCD}": "${r.regionNm}"${!s.last ? ',' : ''}
        </c:forEach>
    };
    const initialCond = { provinceCd: '${empty cond.provinceCd ? "" : cond.provinceCd}' };
    const initial = {
        totals:{ totalCnt:${totals.totalCnt==null?0:totals.totalCnt}, totalDamageArea:${totals.totalDamageArea==null?0:totals.totalDamageArea}, avgDurationMin:${totals.avgDurationMin==null?0:totals.avgDurationMin} },
        yearly:[
            <c:forEach var="r" items="${yearly}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt}, totalDamageArea:${r.totalDamageArea==null?0:r.totalDamageArea}, avgDurationMin:${r.avgDurationMin==null?0:r.avgDurationMin} }${!s.last?',':''}
            </c:forEach>
        ],
        last12Months:[
            <c:forEach var="r" items="${last12Months}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt}, totalDamageArea:${r.totalDamageArea==null?0:r.totalDamageArea}, avgDurationMin:${r.avgDurationMin==null?0:r.avgDurationMin} }${!s.last?',':''}
            </c:forEach>
        ],
        byCause:[
            <c:forEach var="r" items="${byCause}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt}, totalDamageArea:${r.totalDamageArea==null?0:r.totalDamageArea}, avgDurationMin:${r.avgDurationMin==null?0:r.avgDurationMin} }${!s.last?',':''}
            </c:forEach>
        ],
        byProvince:[
            <c:forEach var="r" items="${byProvince}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt}, totalDamageArea:${r.totalDamageArea==null?0:r.totalDamageArea}, avgDurationMin:${r.avgDurationMin==null?0:r.avgDurationMin} }${!s.last?',':''}
            </c:forEach>
        ],
        seasonal:[
            <c:forEach var="r" items="${seasonal}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt} }${!s.last?',':''}
            </c:forEach>
        ],
        monthly:[
            <c:forEach var="r" items="${monthly}" varStatus="s">
            { key:'${r.key}', name:'${r.name}', totalCnt:${r.totalCnt==null?0:r.totalCnt} }${!s.last?',':''}
            </c:forEach>
        ]
    };

    /* ===== 유틸 ===== */
    const nf = new Intl.NumberFormat('ko-KR');
    const $id  = (id)=>document.getElementById(id);   // ★ jQuery와 충돌 안 나게 이름 변경
    function setText(id, v){ const el=$id(id); if(!el) return; el.textContent = (v==null||Number.isNaN(v))?'-':(typeof v==='number'?nf.format(v):v); }
    function provinceNameOf(code){ return code? (REGION_MAP[code]||'전국') : '전국'; }

    // 분 → "X시간 Y분" 변환
    function formatDuration(mins){
        if (mins == null || isNaN(mins)) return '-';
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return h > 0 ? (h + '시간 ' + m + '분') : (m + '분');
    }

    /* ===== KPI ===== */
    function renderKpis(totals, provinceCd){
        setText('kpiTotalCnt', totals?.totalCnt ?? 0);
        setText('kpiTotalArea', Math.round(((totals?.totalDamageArea ?? 0)+Number.EPSILON)*100)/100);
        $id('kpiAvgDur').textContent = formatDuration(totals?.avgDurationMin ?? 0);
        setText('kpiFilterText', provinceNameOf(provinceCd));
    }

    /* ===== 차트 인스턴스 ===== */
    const chLast12   = echarts.init($id('chartLast12'));
    const chYearly   = echarts.init($id('chartYearly'));
    const chMonthly  = echarts.init($id('chartMonthly'));
    const chSeasonal = echarts.init($id('chartSeasonal'));
    const chCause    = echarts.init($id('chartCause'));
    const chProv     = echarts.init($id('chartProvince'));

    /* ===== 공통 옵션 헬퍼 ===== */
    const baseGrid = { left: 56, right: 50, top: 70, bottom: 0, containLabel: true };

    /* ===== 렌더러 ===== */
    function renderLast12(rows){
        const xs   = rows.map(r=>r.key);
        const cnt  = rows.map(r=>r.totalCnt||0);
        const area = rows.map(r=>Math.round(((r.totalDamageArea||0)+Number.EPSILON)*100)/100);

        chLast12.setOption({
            tooltip:{ trigger:'axis' },
            legend:{ top:6, data:['발생건수','피해면적(ha)'] },
            grid: baseGrid,
            xAxis:{ type:'category', data:xs, axisLabel:{ rotate:-30, margin:12, hideOverlap:true } }, // ★
            yAxis:[
                { type:'value', name:'건', axisLabel:{ margin:8, hideOverlap:true } },                 // ★
                { type:'value', name:'ha', alignTicks:true, axisLabel:{ margin:8, hideOverlap:true } } // ★
            ],
            series:[
                { name:'발생건수', type:'bar', data:cnt, barMaxWidth:22 },
                { name:'피해면적(ha)', type:'line', data:area, yAxisIndex:1, smooth:true, symbol:'circle', symbolSize:6 }
            ]
        });
    }

    function renderYearly(rows){
        const xs   = rows.map(r=>r.key);
        const cnt  = rows.map(r=>r.totalCnt||0);
        const area = rows.map(r=>Math.round(((r.totalDamageArea||0)+Number.EPSILON)*100)/100);

        chYearly.setOption({
            tooltip:{ trigger:'axis' },
            legend:{ top:6, data:['발생건수','피해면적(ha)'] },
            grid: baseGrid,
            xAxis:{ type:'category', data:xs, axisLabel:{ rotate:-20, margin:12, hideOverlap:true } }, // ★
            yAxis:[
                { type:'value', name:'건', axisLabel:{ hideOverlap:true } },                            // ★
                { type:'value', name:'ha', alignTicks:true, axisLabel:{ hideOverlap:true } }           // ★
            ],
            series:[
                { name:'발생건수', type:'bar', data:cnt, barMaxWidth:26 },
                { name:'피해면적(ha)', type:'line', data:area, yAxisIndex:1, smooth:true, symbol:'circle', symbolSize:6 }
            ]
        });
    }

    function renderMonthly(rows){
        const xs = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        const map = Object.fromEntries(rows.map(r=>[r.key, r.totalCnt||0]));
        const cnt = xs.map(m=>map[m]||0);

        chMonthly.setOption({
            tooltip:{ trigger:'axis' },
            grid: {...baseGrid, top:6},
            xAxis:{ type:'category', data:xs, axisLabel:{ margin:10, hideOverlap:true } }, // ★
            yAxis:{ type:'value', name:'건', axisLabel:{ hideOverlap:true } },              // ★
            series:[{ type:'bar', data:cnt, barMaxWidth:26 }]
        });
    }

    function renderSeasonal(rows){
        const data = rows.map(r => ({
            name: r.name,
            value: Number(r.totalCnt) || 0
        }));
        chSeasonal.setOption({
            title:{ text:'계절별 발생건수' },
            tooltip:{ trigger:'item', formatter: p => p.name + "<br>" + nf.format(p.value) +"건 (" + p.percent + "%)"},
            legend:{ top:30 },
            grid: { ...baseGrid, left:24, right:24 },
            series:[{
                type:'pie',
                center:['50%','55%'],
                radius:['45%','70%'],
                minAngle:6,
                label:{ formatter:'{b|{b}} {c}건 ({d}%)', rich:{ b:{fontWeight:600} } },
                labelLine:{ length:10, length2:10 },
                data,
                avoidLabelOverlap: true // ★
            }]
        });
    }

    function renderCause(rows){
        const top = [...rows].sort((a,b)=>(b.totalCnt||0)-(a.totalCnt||0)).slice(0,12);
        const names = top.map(r=>r.name);
        const cnt   = top.map(r=>r.totalCnt||0);

        chCause.setOption({
            title:{ text:'원인 TOP 12 (발생건수)' },
            tooltip:{ trigger:'axis' },
            grid:{ ...baseGrid, top:35, left:20, right:30 },
            xAxis:{ type:'value', axisLabel:{ margin:8, formatter: v => nf.format(v), hideOverlap:true } }, // ★
            yAxis:{
                type:'category', data:names, inverse:true,
                axisLabel:{ margin:10, overflow:'truncate', width:160, hideOverlap:true }                    // ★
            },
            series:[{ type:'bar', data:cnt, barCategoryGap:'28%' }]
        });
    }

    function renderProvince(rows){
        const names = rows.map(r=>r.name);
        const cnt   = rows.map(r=>r.totalCnt||0);
        chProv.setOption({
            tooltip:{ trigger:'axis' },
            grid:{ ...baseGrid, top:0, left:20, right:36 },
            xAxis:{ type:'value', axisLabel:{ formatter:v=>nf.format(v), hideOverlap:true } }, // ★
            yAxis:{ type:'category', data:names, inverse:true, axisLabel:{ overflow:'truncate', width:180, hideOverlap:true } }, // ★
            series:[{ type:'bar', data:cnt, barCategoryGap:'28%' }]
        });
    }

    /* ===== 초기 렌더 ===== */
    function hydrateFromServer(){
        $id('provinceSel').value = initialCond.provinceCd || '';
        renderKpis(initial.totals, initialCond.provinceCd);

        renderLast12(initial.last12Months||[]);
        renderYearly(initial.yearly||[]);
        renderMonthly(initial.monthly||[]);
        renderSeasonal(initial.seasonal||[]);
        renderCause(initial.byCause||[]);
        renderProvince(initial.byProvince||[]);
    }

    /* ===== AJAX 대시보드 갱신 ===== */
    async function fetchDashboard(provinceCd){
        const url = new URL('${pageContext.request.contextPath}/forestFireCase/dashboard', location.origin);
        if (provinceCd) url.searchParams.set('regionCd', provinceCd);
        const res = await fetch(url.toString());
        return res.json();
    }
    async function onProvinceChange(){
        const cd = $id('provinceSel').value || '';
        const r  = await fetchDashboard(cd);
        if (r?.result !== 1){ alert(r?.msg || '조회 실패'); return; }
        const d = r.data || {};
        renderKpis(d.totals, cd);
        renderLast12(d.last12Months||[]);
        renderYearly(d.yearly||[]);
        renderMonthly(d.monthly||[]);
        renderSeasonal(d.seasonal||[]);
        renderCause(d.byCause||[]);
        // 지역별은 전국 고정 (미갱신)
    }

    /* ===== 이벤트 & 시작 ===== */
    window.addEventListener('resize', ()=>{
        chLast12.resize(); chYearly.resize(); chMonthly.resize();
        chSeasonal.resize(); chCause.resize(); chProv.resize();
    });
    $id('provinceSel').addEventListener('change', onProvinceChange);
    hydrateFromServer();
</script>
<script src="${pageContext.request.contextPath}/js/common/header.js"></script>
<script src="${pageContext.request.contextPath}/js/common/location.js"></script>
<script src="${pageContext.request.contextPath}/js/common/sidebar.js"></script>
<script src="${pageContext.request.contextPath}/js/common/weather.js"></script>
</body>
</html>
