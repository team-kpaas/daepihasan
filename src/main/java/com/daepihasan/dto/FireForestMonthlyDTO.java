package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FireForestMonthlyDTO {
    private String yearMonth;   // 년월

    private long ocrnMnb;           // 발생건수 합
    private long lifeDmgPercnt;     // 인명피해인원수 합
    private long vctmPercnt;        // 사고자인원수 합
    private long injrdprPercnt;     // 부상자인원수 합
    private long prptDmgSbttAmt;    // 재산피해소계금액 합
}
