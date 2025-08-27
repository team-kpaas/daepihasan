package com.daepihasan.service;

import com.daepihasan.dto.FireForestCauseDTO;
import com.daepihasan.dto.FireForestKpiDTO;
import com.daepihasan.dto.FireForestMonthlyDTO;
import com.daepihasan.dto.FireForestRangeDTO;

import java.util.List;

public interface IFireForestService {
    void ingest(); // 배치 진입점

    // KPI: 현재 구간 vs 전년 동기
    FireForestKpiDTO getKpiYoY(FireForestRangeDTO range);

    List<FireForestCauseDTO> getCausesAgg(FireForestRangeDTO range);

    // 시계열
    List<FireForestMonthlyDTO> getMonthlyTimeSeries(FireForestRangeDTO range);
}