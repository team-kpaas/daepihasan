package com.daepihasan.service;

import com.daepihasan.dto.RegionDTO;

import java.util.List;

public interface IRegionService {
    /** 시도 목록 (LV=1, CODE_STAT='Y') */
    List<RegionDTO> getRegions();

    /** 하위 행정코드 조회 (부모코드 기준), CODE_STAT='Y' */
    List<RegionDTO> getChildrenRegion(String pRegionCD);
}
