package com.daepihasan.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ForestFireCaseDTO {

    // 발생/진화 일시
    private LocalDate ocrnYmd;       // 발생 일자 (YYYY-MM-DD)
    private String ocrnTime;         // 발생 시각 (HH:MM)
    private String ocrnWeekday;      // 발생 요일 (월~일)
    private LocalDate extYmd;        // 진화 종료 일자 (YYYY-MM-DD)
    private String extTime;          // 진화 종료 시각 (HH:MM)
    private Integer durationMin;     // 진화 소요시간 (분)

    // 발생 위치
    private String ocrnAgency;       // 관할 관서
    private String ocrnProvinceCd;   // 발생 시·도 코드
    private String ocrnProvinceNm;   // 발생 시·도명 (REGION 테이블)

    // 원인
    private String causeDetailCd;    // 산불 원인 상세 코드
    private String causeDetailNm;    // 산불 원인 구분 (CODE 테이블)

    // 피해
    private Double damageArea;       // 피해면적 합계(ha)

    // 시스템
    private String regId;
    private LocalDateTime regDt;
    private String chgId;
    private LocalDateTime chgDt;
}
