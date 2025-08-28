package com.daepihasan.service;

import com.daepihasan.dto.*;

import java.util.List;

public interface IFireForestService {
    void ingest(); // 배치 진입점

    // 임야화재 통계 페이지 초기 진입
    FireForestDashboardDTO getFireForestDashboard(FireForestRangeDTO rangeDTO);

    // KPI: 현재 구간 vs 전년 동기
    FireForestKpiDTO getKpiYoY(FireForestRangeDTO rangeDTO);

    // 원인별
    List<FireForestCauseDTO> getCausesAgg(FireForestRangeDTO rangeDTO);

    // 시계열
    List<FireForestMonthlyDTO> getMonthlyTotal();
}