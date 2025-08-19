package com.daepihasan.controller;

import com.daepihasan.dto.WeatherCacheDTO;
import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.service.IWeatherService;
import com.daepihasan.util.CmmUtil;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequestMapping(value = "/weather")
@RequiredArgsConstructor
@RestController
public class WeatherController {

    private final IWeatherService weatherService;

    @GetMapping("/get")
    public ResponseEntity<List<WeatherDTO>> getWeather(HttpSession session,
                                                       @RequestParam String lat,
                                                       @RequestParam String lng) {
        log.info("{}.weather/get Start!", this.getClass().getName());

        log.info("lat:{} lng:{}",  lat, lng);
        WeatherCacheDTO pDTO = WeatherCacheDTO.builder()
                                            .lat(CmmUtil.nvl(lat))
                                            .lng(CmmUtil.nvl(lng))
                                            .build();

        String ssUserId = (String) session.getAttribute("SS_USER_ID");
        log.info("ssUserId: {}", ssUserId);

        List<WeatherDTO> result = weatherService.getWeather(pDTO, ssUserId).getWeatherList();

        log.info("{}.weather/get End!", this.getClass().getName());
        return ResponseEntity.ok(result);
    }
}