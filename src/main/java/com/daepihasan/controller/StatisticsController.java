package com.daepihasan.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Slf4j
@RequestMapping(value = "/dashboard")
@RequiredArgsConstructor
@Controller
public class StatisticsController {

    // 1. 임야 화제 통계 페이지 이동
    @GetMapping("fireForest")
    public String getFireForestDashboard() {
        log.info("{}.getFireForestDashboard Start!", this.getClass().getName());


        log.info("{}.getFireForestDashboard End!", this.getClass().getName());
        return "dashboard/fireForest";
    }
}
