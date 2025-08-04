package com.daepihasan.controller;

import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Slf4j
@RequestMapping(value = "/api")
@RequiredArgsConstructor
@Controller
public class WeatherController {

    private final IWeatherService weatherService;

    @GetMapping("/weather")
    public ResponseEntity<List<WeatherDTO>> getWeather(@RequestParam String x, @RequestParam String y) {
        log.info("{}.api/weather Start!", this.getClass().getName());

        log.info("x:{} y:{}", x, y);
        List<WeatherDTO> result = weatherService.getWeather(x, y);

        log.info("{}.api/weather End!", this.getClass().getName());
        return ResponseEntity.ok(result);
    }
}
