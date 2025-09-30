package com.daepihasan.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ForestFireCaseDashboardDTO {

    // 누적
    private ForestFireCaseStatDTO totals;

    // 연도별 / 연도 평균
    private List<ForestFireCaseStatDTO> yearly;
    private ForestFireCaseStatDTO yearlyAvg;

    // 최근 12개월(YYYY-MM)
    private List<ForestFireCaseStatDTO> last12Months;

    // 분류별
    private List<ForestFireCaseStatDTO> byCause;
    private List<ForestFireCaseStatDTO> byProvince; // 전국 랭킹 or 특정 시도면 그 시도만

    // 계절/월
    private List<ForestFireCaseStatDTO> seasonal;
    private List<ForestFireCaseStatDTO> monthly;
}