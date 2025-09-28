package com.daepihasan.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@RequestMapping(value = "/fireForecast")
@RequiredArgsConstructor
@Controller
public class FireForecastController {

    @GetMapping(value = "")
    public String forecastPage() {
        log.info("{}.forecastPage start!", this.getClass().getName());

        log.info("{}.forecastPage End!", this.getClass().getName());

        return "forecast/fireForecast";
    }
}
