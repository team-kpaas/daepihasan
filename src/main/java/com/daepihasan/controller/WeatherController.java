package com.daepihasan.controller;

import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.service.IWeatherService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

import static com.daepihasan.util.WeatherUtil.toXY;

@Slf4j
@RequestMapping(value = "/api")
@RequiredArgsConstructor
@Controller
public class WeatherController {

    private final IWeatherService weatherService;

    @GetMapping("/weather")
    public ResponseEntity<List<WeatherDTO>> getWeather(HttpSession session,
                                                       @RequestParam double lat,
                                                       @RequestParam double lng) {
        log.info("{}.api/weather Start!", this.getClass().getName());


        log.info("lat:{} lng:{}",  lat, lng);

        Map<String, Integer> xy = toXY(lat, lng);
        Integer x =  xy.get("x");
        Integer y =  xy.get("y");

        String ssUserId = (String) session.getAttribute("SS_USER_ID");

        log.info("x: {} y: {} ssUserId: {}", x, y, ssUserId);
        List<WeatherDTO> result = weatherService.getWeather(x, y, ssUserId);

        log.info("{}.api/weather End!", this.getClass().getName());
        return ResponseEntity.ok(result);
    }
}
