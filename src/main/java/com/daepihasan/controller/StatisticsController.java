package com.daepihasan.controller;

import com.daepihasan.dto.FireForestCauseDTO;
import com.daepihasan.dto.FireForestKpiDTO;
import com.daepihasan.dto.FireForestRangeDTO;
import com.daepihasan.dto.MsgDTO;
import com.daepihasan.service.IFireForestService;
import com.daepihasan.util.CmmUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@Slf4j
@RequestMapping(value = "/stat")
@RequiredArgsConstructor
@RestController
public class StatisticsController {

    // 의존성 주입
    private final IFireForestService fireForestService;



    // 1. 임야 화제 통계 수집
    @GetMapping("/fire-forest/ingest")
    public String ingest() {
        log.info("{}.ingest Start!", this.getClass().getName());

        fireForestService.ingest();

        log.info("{}.ingest End!", this.getClass().getName());
        return "OK";
    }

    // 2. 산불 통계
    /**
     *  2.1. KPI 조회(현재 지정한 기간과 전동기 통계자료 비교
     */
    @PostMapping("/fire-forest/kpi")
    public MsgDTO getFireForestKpi(HttpServletRequest request) {
        log.info("{}.getFireForestKpi Start!", this.getClass().getName());

        MsgDTO dto = new MsgDTO();
        int res = 0; // 날짜 선택이 올바르지 않은 경우: 0, 날짜 선택이 올바른 경우: 1, 비정상 접근: 2
        String msg; // 메시지

        try {
            // 1) 파라미터 읽기 + 기본값(없으면: 한 달 전 ~ 오늘)
            LocalDate today = LocalDate.now();
            LocalDate defaultFrom = today.minusMonths(1);
            LocalDate defaultTo   = today;

            String fromParam = CmmUtil.nvl(request.getParameter("from")); // 없으면 ""
            String toParam   = CmmUtil.nvl(request.getParameter("to"));

            LocalDate from = fromParam.isBlank() ? defaultFrom : LocalDate.parse(fromParam);
            LocalDate to   = toParam.isBlank()   ? defaultTo   : LocalDate.parse(toParam);

            log.info("날짜 선택 from: {}", from);
            log.info("날짜 선택 to: {}", to);
            FireForestRangeDTO range = FireForestRangeDTO.builder()
                    .from(from)
                    .to(to)
                    .prevFrom(from.minusYears(1))
                    .prevTo(to.minusYears(1))
                    .build();


            // 2) 유효성 검사(from <= to)
            if (from.isAfter(to)) {
                res = 0;
                msg = "날짜 선택이 올바르지 않습니다.";
                dto.setResult(res);
                dto.setMsg(msg);
                log.info("{}.getFireForestKpi End!(invalid range)", this.getClass().getName());
                return dto;
            }

            // 3) 서비스 호출
            FireForestKpiDTO kpi = fireForestService.getKpiYoY(range);

            // 4) 성공 응답
            res = 1;
            msg = "정상적으로 조회되었습니다.";
            dto.setResult(res);
            dto.setMsg(msg);
            dto.setData(kpi);

            log.info("KPI: {}", kpi);

        } catch (Exception e) {
            // 5) 예외 처리
            log.warn("{}.getFireForestKpi error", this.getClass().getName(), e);
            res = 2;
            msg = "비정상적인 접근이거나 서버 오류가 발생했습니다.";
            dto.setResult(res);
            dto.setMsg(msg);
            dto.setData(null);
        } finally {
            // 6) 데이터 전달
            log.info("{}.getFireForestKpi End!", this.getClass().getName());
            return dto;
        }
    }

    /**
     *  2.2. 임야 화재 원인별 통계자료
     */
    @PostMapping("/fire-forest/causes")
    @ResponseBody
    public MsgDTO getFireForestCauses(HttpServletRequest request) {
        MsgDTO dto = new MsgDTO();
        int res = 0; // 날짜 선택이 올바르지 않은 경우: 0, 날짜 선택이 올바른 경우: 1, 비정상 접근: 2, 해당 원인의 결과가 없는 경우: 3
        String msg; // 메시지

        try {
            // 1) 파라미터 읽기 + 기본값(없으면: 한 달 전 ~ 오늘)
            LocalDate today = LocalDate.now();
            LocalDate defaultFrom = today.minusMonths(1);
            LocalDate defaultTo   = today;

            String fromParam = CmmUtil.nvl(request.getParameter("from")); // 없으면 ""
            String toParam   = CmmUtil.nvl(request.getParameter("to"));

            LocalDate from = fromParam.isBlank() ? defaultFrom : LocalDate.parse(fromParam);
            LocalDate to   = toParam.isBlank()   ? defaultTo   : LocalDate.parse(toParam);

            log.info("날짜 선택 from: {}", from);
            log.info("날짜 선택 to: {}", to);

            String codeCd = CmmUtil.nvl(request.getParameter("codeCd")); // 선택 코드
            log.info("선택 코드 codeCd: {}", codeCd);

            LocalDate maxQueryable = LocalDate.now().minusDays(1);
            if (to.isAfter(maxQueryable)) to = maxQueryable;
            if (from.isAfter(to)) {
                dto.setResult(0);
                dto.setMsg("날짜 선택이 올바르지 않습니다.");
                return dto;
            }

            FireForestRangeDTO range = FireForestRangeDTO.builder()
                    .from(from)
                    .to(to)
                    .codeCd(codeCd)
                    .build();

            List<FireForestCauseDTO> list = fireForestService.getCausesAgg(range);
            if(list.isEmpty()) {
                dto.setResult(3);
                dto.setMsg("해당 원인의 임야 화재 정보가 없습니다.");
                dto.setData(list);
                return dto;
            }

            dto.setResult(1);
            dto.setMsg("정상적으로 조회되었습니다.");
            dto.setData(list);
            return dto;

        } catch (Exception e) {
            dto.setResult(2);
            dto.setMsg("비정상적인 접근이거나 서버 오류가 발생했습니다.");
            return dto;
        }
    }

    /**
     * 2.3 최근 12개월 월별 시계열 통계자료
     */
    @PostMapping("/fire-forest/monthly")
    @ResponseBody
    public MsgDTO monthlySeries(HttpServletRequest req) {
        MsgDTO dto = new MsgDTO();
        try {
            String toParam   = CmmUtil.nvl(req.getParameter("to"));      // yyyy-MM-dd (옵션)
            String codeParam = CmmUtil.nvl(req.getParameter("codeCd"));  // 옵션
            String metric    = CmmUtil.nvl(req.getParameter("metric"));  // OCRN/LIFE/VCTM/INJRDPR/PRPT

            FireForestRangeDTO r = FireForestRangeDTO.builder()
                    .to(toParam.isBlank() ? null : LocalDate.parse(toParam))
                    .codeCd(codeParam.isBlank() ? null : codeParam)
                    .metric(metric.isBlank() ? "OCRN" : metric)
                    .build();

            dto.setData(fireForestService.getMonthlyTimeSeries(r));
            dto.setResult(1);
            dto.setMsg("정상적으로 조회되었습니다.");
            return dto;
        } catch (Exception e) {
            dto.setResult(2);
            dto.setMsg("서버 오류가 발생했습니다.");
            return dto;
        }
    }
}
