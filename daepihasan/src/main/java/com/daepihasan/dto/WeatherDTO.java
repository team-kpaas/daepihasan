package com.daepihasan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
public class WeatherDTO {
    private String date;     // 예보 날짜 (예: "20250804")
    private String time;     // 예보 시간 (예: "0600")
    private String temp;     // 기온 (T1H)
    private String sky;      // 하늘 상태 코드 (SKY)
    private String pty;      // 강수 형태 (PTY)
    private String rn1;      // 1시간 강수량 (RN1)
    private String reh;      // 습도 (REH)
    private String wsd;      // 풍속 (WSD)
    private String vec;      // 풍향 (VEC)
    private String windInfo; // ex: 남동풍 (4 m/s)
    private String lgt;      // 낙뢰 (LGT)
    private String uuu;      // 동서 바람 성분 (UUU)
    private String vvv;      // 남북 바람 성분 (VVV)
    private String icon;     // 날씨 아이콘 경로
    private String desc;     // 날씨 설명 (맑음, 흐림 등)
}

