package com.daepihasan.dto;

import lombok.Data;

import java.util.List;

@Data
public class FireFacilityBBoxDTO {
    private double minLat, maxLat, minLon, maxLon;

    // 선택값: 없으면 bbox 중앙으로 대체
    private Double centerLat;
    private Double centerLon;

    // 선택값: 결과 수 (기본 10)
    private Integer limit;

    // 선택값: 타입 코드 리스트 (DB에 저장된 코드값, 예: 6=소화전, 2=급수탑, 1=비상소화, 4=저수조 등)
    private List<Integer> types;
}