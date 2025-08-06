package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
public class WeatherCacheDTO {
    private String x;           // 격자 X
    private String y;           // 격자 Y
    private String baseDate;    // 예보 기준 날짜 (예: 20250805)
    private String baseTime;    // 예보 기준 시간 (예: 1130)
    private String data;        // JSON 문자열

    private String regId;
    private String chgId;
}
