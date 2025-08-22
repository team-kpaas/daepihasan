package com.daepihasan.mapper;

import com.daepihasan.dto.FireForestKpiDTO;
import com.daepihasan.dto.FireForestStatDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface IFireForestMapper {

    /** FIRE_FOREST_STAT 비어있으면 null, 있으면 최대 발생일 */
    LocalDate selectMaxOcrnYmd();

    /** FIRE_FOREST_STAT UPSERT(덮어쓰기) - PK: (WDLD_SCLSF_CD, OCRN_YMD) */
    int upsertFireForestStat(FireForestStatDTO pDTO);

    /** KPI: 현재 구간 vs 전년 동기 */
    FireForestKpiDTO selectKpiYoY(@Param("from") LocalDate from,
                                  @Param("to")   LocalDate to);
}
