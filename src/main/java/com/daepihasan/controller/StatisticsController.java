package com.daepihasan.controller;

import com.daepihasan.dto.FireForestKpiDTO;
import com.daepihasan.service.IFireForestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;


@Slf4j
@RequestMapping(value = "/stat")
@RequiredArgsConstructor
@RestController
public class StatisticsController {

    // 의존성 주입
    private final IFireForestService fireForestService;

    // 1. 임야 화제 통계
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
    public FireForestKpiDTO getFireForestKpi() {
        log.info("{}.getFireForestKpi Start!,", this.getClass().getName());

        FireForestKpiDTO kpi = fireForestService.getKpiYoY(
                LocalDate.of(2025,1,1),
                LocalDate.of(2025,12,31)
        );

        log.info(kpi.toString());

        log.info("{}.getFireForestKpi End!,", this.getClass().getName());
        return kpi;
    }
}
