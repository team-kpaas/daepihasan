package com.daepihasan.controller;

import com.daepihasan.dto.FireFacilityBBoxDTO;
import com.daepihasan.dto.FireFacilityItemDTO;
import com.daepihasan.service.IFireFacilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/facility")
@Slf4j
public class FireFacilityController {

    private final IFireFacilityService service;
    //api 값 가져오기
    @PostMapping("/ingest-all")
    public ResponseEntity<?> ingestAll() {
        int rows = service.ingestAll();
        return ResponseEntity.ok(Map.of("rows", rows, "status", "ok"));
    }

    // 지도 BBox 조회
    @GetMapping("/bbox")
    public List<FireFacilityItemDTO> bbox(FireFacilityBBoxDTO cond) {
        // 기본 limit
        if (cond.getLimit() == null || cond.getLimit() <= 0) cond.setLimit(10);

        // center 없으면 bbox 중앙 사용
        if (cond.getCenterLat() == null || cond.getCenterLon() == null) {
            cond.setCenterLat((cond.getMinLat() + cond.getMaxLat()) / 2.0);
            cond.setCenterLon((cond.getMinLon() + cond.getMaxLon()) / 2.0);
        }

        // 타입 화이트리스트(예: 1,2,4,6만 허용)
        if (cond.getTypes() != null) {
            cond.setTypes(
                    cond.getTypes().stream()
                            .filter(t -> t == 1 || t == 2 || t == 4 || t == 6)
                            .distinct()
                            .toList()
            );
            if (cond.getTypes().isEmpty()) cond.setTypes(null);
        }

        return service.findFacilitiesInBBox(cond);
    }
}
