package com.daepihasan.service;

import com.daepihasan.dto.ForestFireCaseDTO;
import com.daepihasan.dto.ForestFireCaseDashboardDTO;
import com.daepihasan.dto.ForestFireCaseStatDTO;
import com.daepihasan.dto.ForestFireSearchDTO;

import java.util.List;

public interface IForestFireCaseService {

    /* ===== 상세 조회 ===== */
    List<ForestFireCaseDTO> getCases(ForestFireSearchDTO pDTO);
    long countCases(ForestFireSearchDTO pDTO);

    /* ==== 누적 합계 ==== */
    ForestFireCaseStatDTO totals(ForestFireSearchDTO pDTO);

    /* ===== 통계 ===== */
    List<ForestFireCaseStatDTO> yearlyCounts(ForestFireSearchDTO pDTO);

    ForestFireCaseStatDTO yearlyAverage(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> causeCounts(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> provinceCountsAll(); // 전국
    List<ForestFireCaseStatDTO> provinceCounts(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> yearlyDamageStats(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> seasonalCounts(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> monthlyCounts(ForestFireSearchDTO pDTO);

    List<ForestFireCaseStatDTO> last12MonthsStats(ForestFireSearchDTO pDTO);

    ForestFireCaseDashboardDTO dashboard(ForestFireSearchDTO pDTO);

}