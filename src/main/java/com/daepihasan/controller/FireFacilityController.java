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
        return service.findFacilitiesInBBox(cond);
    }

    @PostMapping("/ingest-range")
    public ResponseEntity<Map<String, Object>> ingestRange(
            @RequestParam int from,
            @RequestParam int to,
            @RequestParam(defaultValue = "100") int size) {

        int rows = service.ingestRange(from, to, size);
        log.info("[INGEST-RANGE] done from={} to={} size={} rows={}", from, to, size, rows);

        return ResponseEntity.ok(Map.of(
                "from", from,
                "to", to,
                "pageSize", size,
                "rows", rows,
                "status", "ok"
        ));
    }
}
