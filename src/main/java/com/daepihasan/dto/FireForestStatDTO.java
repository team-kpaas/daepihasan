package com.daepihasan.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireForestStatDTO {
    private String wdldSclsfCd;      // 대분류 코드(CODE.CODE_CD)
    private String wdldSclsfNm;      // 대분류명
    private LocalDate ocrnYmd;      // 발생년월일

    private long ocrnMnb;           // 발생건수
    private long lifeDmgPercnt;     // 인명피해인원수
    private long vctmPercnt;        // 사고자인원수
    private long injrdprPercnt;     // 부상자인원수
    private long prptDmgSbttAmt;    // 재산피해소계금액

    private LocalDate searchDate;   // 데이터 수집일자(API 호출일)
    private String regId;
    private LocalDateTime regDt;
    private String chgId;
    private LocalDateTime chgDt;
}
