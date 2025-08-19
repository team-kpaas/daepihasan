package com.daepihasan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class WeatherCacheDTO {
    private Integer x;          // 격자 X
    private Integer y;          // 격자 Y
    private String lat;         // 위도
    private String lng;         // 경도
    private String baseDate;    // 예보 기준 날짜 (예: 20250805)
    private String baseTime;    // 예보 기준 시간 (예: 1130)
    private String data;        // JSON 문자열

    private String regId;
    private String regDt;
    private String chgId;
    private String chgDt;

    // API 요청시 부터 6시간의 초단기 예보
    private List<WeatherDTO> weatherList;
}
