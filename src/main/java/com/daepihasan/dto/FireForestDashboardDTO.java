package com.daepihasan.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireForestDashboardDTO {
    private FireForestKpiDTO kpi; // 상단 KPI
    private List<CodeDTO> codeList; // 셀렉트 박스 옵션(임야 코드 하위)
    private List<FireForestCauseDTO> causeList; // 원인별 통계
}
