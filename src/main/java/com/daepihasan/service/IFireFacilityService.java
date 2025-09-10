package com.daepihasan.service;

import com.daepihasan.dto.FireFacilityBBoxDTO;
import com.daepihasan.dto.FireFacilityDTO;
import com.daepihasan.dto.FireFacilityItemDTO;

import java.util.List;

public interface IFireFacilityService {
    int ingestAll();
    List<FireFacilityDTO> fetchPage(int pageNo, int numOfRows);
    List<FireFacilityItemDTO> findFacilitiesInBBox(FireFacilityBBoxDTO cond); // ← 수정
    int ingestRange(int from, int to, int size);
}