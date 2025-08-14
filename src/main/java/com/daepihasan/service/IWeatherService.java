package com.daepihasan.service;

import com.daepihasan.dto.WeatherCacheDTO;

public interface IWeatherService {

    String apiURL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

    WeatherCacheDTO getWeather(WeatherCacheDTO pDTO, String ssUserId);
}
