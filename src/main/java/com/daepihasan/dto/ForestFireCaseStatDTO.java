package com.daepihasan.dto;

import lombok.*;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ForestFireCaseStatDTO {
    private String key;         // 그룹키 (예: '31' / '101001' / '2025-01')
    private String name;        // 그룹명 (예: '경기도' / '담뱃불실화' / '2025-01')
    private Long totalCnt;           // 건수
    private Double totalDamageArea;     // 피해면적 합계(ha)
    private Double avgDurationMin; // 평균 진화시간(분)
}
