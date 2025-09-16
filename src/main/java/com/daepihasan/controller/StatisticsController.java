package com.daepihasan.controller;

import com.daepihasan.dto.ForestFireCaseStatDTO;
import com.daepihasan.dto.ForestFireSearchDTO;
import com.daepihasan.dto.RegionDTO;
import com.daepihasan.service.IForestFireCaseService;
import com.daepihasan.service.IRegionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;


@Slf4j
@RequestMapping(value = "/dashboard")
@RequiredArgsConstructor
@Controller
public class StatisticsController {

    private final IForestFireCaseService forestFireCaseService;
    private final IRegionService regionService;

    // 1. 임야 화제 통계 페이지 이동
    @GetMapping("fireForest")
    public String getFireForestDashboard() {
        log.info("{}.getFireForestDashboard Start!", this.getClass().getName());


        log.info("{}.getFireForestDashboard End!", this.getClass().getName());
        return "dashboard/fireForest";
    }

    // 2. 산불 화제 통계 페이지 이동
    @GetMapping("forestFireCase")
    public String getForestFireCase(ModelMap model) {
        log.info("{}.getForestFireCase Start!", this.getClass().getName());

        // 전국(필터 없음) 조건
        ForestFireSearchDTO cond = new ForestFireSearchDTO();

        // 화면에서 현재 필터 표시용 (초기값: 전국)
        model.addAttribute("cond", cond);

        List<RegionDTO> regions = regionService.getRegions();
        model.addAttribute("regions", regions);

        // 누적
        model.addAttribute("totals", forestFireCaseService.totals(cond));

        // 연도별 / 연도평균
        List<ForestFireCaseStatDTO> yearly = forestFireCaseService.yearlyCounts(cond);
        model.addAttribute("yearly", yearly);
        model.addAttribute("yearlyAvg", forestFireCaseService.yearlyAverage(cond));

        // 최근 12개월(YYYY-MM)
        model.addAttribute("last12Months", forestFireCaseService.last12MonthsStats(cond));

        // 원인/지역/계절/월별
        model.addAttribute("byCause", forestFireCaseService.causeCounts(cond));
//        model.addAttribute("byProvince", forestFireCaseService.provinceCounts(cond));
        model.addAttribute("byProvince", forestFireCaseService.provinceCountsAll());
        model.addAttribute("seasonal", forestFireCaseService.seasonalCounts(cond));
        model.addAttribute("monthly", forestFireCaseService.monthlyCounts(cond));

        log.info("{}.getForestFireCase End!", this.getClass().getName());
        return "dashboard/forestFireCase";
    }
}
