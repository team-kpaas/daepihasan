package com.daepihasan.service;

import com.daepihasan.dto.FireForestKpiDTO;

import java.time.LocalDate;

public interface IFireForestService {
    void ingest(); // 배치 진입점

    // KPI: 현재 구간 vs 전년 동기
    FireForestKpiDTO getKpiYoY(LocalDate from, LocalDate to);
}