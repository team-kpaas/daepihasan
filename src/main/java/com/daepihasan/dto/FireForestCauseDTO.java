package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireForestCauseDTO {
    private String wdldSclsfCd;      // 소분류 코드(CODE.CODE_CD)
    private String wdldSclsfNm;      // 소분류명

    private long ocrnMnb;           // 발생건수
    private long lifeDmgPercnt;     // 인명피해인원수
    private long vctmPercnt;        // 사고자인원수
    private long injrdprPercnt;     // 부상자인원수
    private long prptDmgSbttAmt;    // 재산피해소계금액
}
