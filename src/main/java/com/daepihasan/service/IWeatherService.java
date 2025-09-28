package com.daepihasan.service;

import com.daepihasan.dto.WeatherCacheDTO;

public interface IWeatherService {

    String apiURL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
    String kmaApiURL = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";


    WeatherCacheDTO getWeather(WeatherCacheDTO pDTO, String ssUserId);
}
