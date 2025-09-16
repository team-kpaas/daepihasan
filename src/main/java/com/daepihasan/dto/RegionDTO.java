package com.daepihasan.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RegionDTO {
    private String regionCD;    // 지역 코드
    private String pRegionCD;   // 부모 코드
    private String regionNm;    // 시도명
    private String lv;          // LV
    private String codeStat;    // 'Y' 사용여부
    private String regId;
    private LocalDateTime regDt;
    private String chgId;
    private LocalDateTime chgDt;
}
