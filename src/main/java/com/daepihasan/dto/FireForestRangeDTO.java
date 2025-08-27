package com.daepihasan.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor @ToString
public class FireForestRangeDTO {
    private LocalDate from;      // 현재 구간 시작일
    private LocalDate to;        // 현재 구간 종료일
    private LocalDate prevFrom;  // 전동기 구간 시작일
    private LocalDate prevTo;    // 전동기 구간 종료일
    private String codeCd;      // 선택된 소분류 코드
    private String metric;      // 지표 선택: OCRN/LIFE/VCTM/INJRDPR/PRPT
}
