package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FireForestKpiDTO {
    // 발생건수
    private Long cntPrev;     // 전동기 발생건수
    private Long cntCur;      // 현재 발생건수
    private Long cntDiff;     // 증감(건수)
    private Integer cntDiffPct; // 증감률(%)

    // 재산피해
    private Long propPrev;    // 전동기 재산피해
    private Long propCur;     // 현재 재산피해
    private Long propDiff;    // 증감(금액)
    private Integer propDiffPct; // 증감률(%)

    // 사망
    private Long deathPrev;   // 전동기 사망자수
    private Long deathCur;    // 현재 사망자수
    private Long deathDiff;   // 증감(인)
    private Integer deathDiffPct; // 증감률(%)

    // 부상
    private Long injuryPrev;  // 전동기 부상자수
    private Long injuryCur;   // 현재 부상자수
    private Long injuryDiff;  // 증감(인)
    private Integer injuryDiffPct; // 증감률(%)
}
