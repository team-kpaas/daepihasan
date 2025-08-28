package com.daepihasan.mapper;

import com.daepihasan.dto.*;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface IFireForestMapper {

    /** FIRE_FOREST_STAT 비어있으면 null, 있으면 최대 발생일 */
    LocalDate getMaxOcrnYmd();

    /** FIRE_FOREST_STAT UPSERT(덮어쓰기) - PK: (WDLD_SCLSF_CD, OCRN_YMD) */
    int upsertFireForestStat(FireForestStatDTO pDTO);

    /** KPI: 현재 구간 vs 전년 동기 */
    FireForestKpiDTO getKpiYoY(FireForestRangeDTO range);

    /** 원인별(소분류) 화재 통계 */
    List<FireForestCauseDTO> getCausesAgg(FireForestRangeDTO pDTO);

    List<FireForestMonthlyDTO> getMonthlyTotal(FireForestRangeDTO range);
}
