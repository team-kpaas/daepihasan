package com.daepihasan.controller;

import com.daepihasan.service.IFireForestStatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RequestMapping(value = "/stat")
@RequiredArgsConstructor
@RestController
public class StatisticsController {

    // 의존성 주입
    private final IFireForestStatService fireForestStatService;

    //    1. 임야 화제 통계
    @GetMapping("/fire-forest/ingest")
    public String ingest() {
        log.info("{}.ingest Start!", this.getClass().getName());

        fireForestStatService.ingest();

        log.info("{}.ingest End!", this.getClass().getName());
        return "OK";
    }

    //    2. 산불 통계
}
