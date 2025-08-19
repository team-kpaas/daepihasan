package com.daepihasan.mapper;

import com.daepihasan.dto.WeatherCacheDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IWeatherCacheMapper {

    // 캐시 데이터 조회
    WeatherCacheDTO getWeatherCache(WeatherCacheDTO pDTO) throws Exception;

    // 기존 캐시 데이터 삭제
    int deleteWeatherCache(WeatherCacheDTO pDTO) throws Exception;

    // 캐시 데이터 등록
    int insertWeatherCache(WeatherCacheDTO pDTO) throws Exception;
}
