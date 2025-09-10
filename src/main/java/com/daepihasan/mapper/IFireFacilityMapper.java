package com.daepihasan.mapper;

import com.daepihasan.dto.FireFacilityBBoxDTO;
import com.daepihasan.dto.FireFacilityDTO;
import com.daepihasan.dto.FireFacilityItemDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IFireFacilityMapper {

    // 단건 업서트 (XML: upsertFireFacility)
    int upsertFireFacility(FireFacilityDTO p);

    // 벌크 업서트 (XML: upsertFireFacilityBulk)  ← collection="list" 매칭
    int upsertFireFacilityBulk(List<FireFacilityDTO> list);

    // BBox 조회 (XML: findFacilitiesInBBox)
    List<FireFacilityItemDTO> findFacilitiesInBBox(FireFacilityBBoxDTO cond);
}
