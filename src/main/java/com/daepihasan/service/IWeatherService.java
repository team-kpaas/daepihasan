package com.daepihasan.service;

import com.daepihasan.dto.WeatherDTO;

import java.util.List;

public interface IWeatherService {
    List<WeatherDTO> getWeather(Integer x, Integer y, String ssUserId);
}
