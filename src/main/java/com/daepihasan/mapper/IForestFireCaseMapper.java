package com.daepihasan.mapper;

import com.daepihasan.dto.ForestFireCaseDTO;
import com.daepihasan.dto.ForestFireCaseStatDTO;
import com.daepihasan.dto.ForestFireSearchDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IForestFireCaseMapper {

    /* 상세 조회 (선택) */
    List<ForestFireCaseDTO> selectCases(ForestFireSearchDTO pDTO);
    long countCases(ForestFireSearchDTO pDTO);

    /* 누적 합계(카드) */
    ForestFireCaseStatDTO totals(ForestFireSearchDTO pDTO);

    /* 통계 */
    List<ForestFireCaseStatDTO> yearlyCounts(ForestFireSearchDTO pDTO);      // 전체 연도별

    ForestFireCaseStatDTO yearlyAverage(ForestFireSearchDTO pDTO);           // 전체 연도 평균

    List<ForestFireCaseStatDTO> causeCounts(ForestFireSearchDTO pDTO);       // 전체 원인별

    List<ForestFireCaseStatDTO> provinceCounts(ForestFireSearchDTO pDTO);           // 시도별 산불 현황
    List<ForestFireCaseStatDTO> provinceCountsAll();                                // 전체 시도별 산불 현황

    List<ForestFireCaseStatDTO> yearlyDamageStats(ForestFireSearchDTO pDTO);        // 연간(전체) 발생/면적

    List<ForestFireCaseStatDTO> seasonalCounts(ForestFireSearchDTO pDTO);           // 계절별(전체)

    List<ForestFireCaseStatDTO> monthlyCounts(ForestFireSearchDTO pDTO);            // 월별(전체, 1~12)

    List<ForestFireCaseStatDTO> last12MonthsStats(ForestFireSearchDTO pDTO);        // 최근 12개월 통계
}
