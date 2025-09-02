package com.daepihasan.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * TMap 화면 렌더 + POI 검색 프록시 컨트롤러 (단일 파일 버전)
 * - GET /view/map         : JSP 렌더링 (SDK appKey 전달)
 * - GET /api/map/search   : 자동완성/POI 검색 (서버에서 Tmap REST 호출)
 */
@Controller
public class TMapController {

    @Value("${tmap.api.key}")
    private String tmapApiKey;

    // ========== 1) 뷰 반환 ==========
    @GetMapping("/view/map")
    public String map(Model model) {
        // SDK 스크립트 로딩용 (콘솔에서 도메인(Referer) 제한 설정 권장)
        model.addAttribute("tmapApiKey", tmapApiKey);
        return "common/tmap";
    }

    // ========== 2) 검색 프록시 API ==========
    @GetMapping(value = "/api/map/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> search(
            @RequestParam("q") String keyword,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lon", required = false) Double lon,
            @RequestParam(value = "count", defaultValue = "10") int count
    ) {

        // Tmap POI 검색 REST
        String url = "https://apis.openapi.sk.com/tmap/pois?version=1&format=json"
                + "&searchKeyword={q}"
                + (lat != null && lon != null ? "&centerLat={lat}&centerLon={lon}" : "")
                + "&count={count}";

        HttpHeaders headers = new HttpHeaders();
        headers.set("appKey", tmapApiKey); // ★ 서버에서만 사용(프런트 노출 금지)
        HttpEntity<Void> req = new HttpEntity<>(headers);

        Map<String, Object> vars = new HashMap<>();
        vars.put("q", keyword);
        vars.put("lat", lat);
        vars.put("lon", lon);
        vars.put("count", count);

        RestTemplate rest = new RestTemplate();

        try {
            // 문자열로 받아 상태/본문을 보존 (에러시 그대로 전달 가능)
            ResponseEntity<String> upstream = rest.exchange(url, HttpMethod.GET, req, String.class, vars);
            HttpStatusCode status = upstream.getStatusCode();
            String raw = upstream.getBody();

            // 2xx가 아니면 원문 그대로 프록시 (프런트 콘솔에서 원인 확인)
            if (!status.is2xxSuccessful()) {
                return ResponseEntity.status(status)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(raw != null ? raw : "{\"error\":\"upstream_error\"}");
            }

            // 본문이 없으면 빈 리스트로 안전 반환
            if (raw == null || raw.isBlank()) {
                return ResponseEntity.ok(Map.of("items", List.of()));
            }

            // JSON 파싱
            ObjectMapper om = new ObjectMapper();
            Map<String, Object> root = om.readValue(raw, new TypeReference<>() {});
            Map<String, Object> searchPoiInfo = asMap(root.get("searchPoiInfo"));
            Map<String, Object> pois          = asMap(searchPoiInfo.get("pois"));
            List<Map<String, Object>> list    = asListOfMap(pois.get("poi"));

            // 필요한 필드만 정제
            List<Map<String, Object>> items = new ArrayList<>();
            for (Map<String, Object> p : list) {
                Map<String, Object> r = new HashMap<>();
                r.put("id", p.get("id"));
                r.put("name", p.get("name"));

                String address = String.join(" ",
                        safeStr(p.get("upperAddrName")),
                        safeStr(p.get("middleAddrName")),
                        safeStr(p.get("lowerAddrName")),
                        safeStr(p.get("roadName"))
                ).replaceAll("\\s+", " ").trim();
                r.put("address", address);

                // 좌표: frontLat/Lon 우선, 없으면 noorLat/Lon 폴백
                Object latVal = p.get("frontLat") != null ? p.get("frontLat") : p.get("noorLat");
                Object lonVal = p.get("frontLon") != null ? p.get("frontLon") : p.get("noorLon");
                r.put("lat", latVal);
                r.put("lon", lonVal);

                r.put("category", p.get("bizCatName"));
                items.add(r);
            }

            return ResponseEntity.ok(Map.of("items", items));

        } catch (HttpStatusCodeException e) {
            // 4xx/5xx를 RestTemplate이 예외로 던진 경우
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString() != null ? e.getResponseBodyAsString()
                            : "{\"error\":\"upstream_http_exception\"}");
        } catch (Exception e) {
            // 기타 예외
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "server_error", "message", e.getMessage()));
        }
    }

    // ===== 유틸 =====
    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> asListOfMap(Object o) {
        return (o instanceof List) ? (List<Map<String, Object>>) o : Collections.emptyList();
    }

    private String safeStr(Object o) {
        return o == null ? "" : String.valueOf(o);
    }
}
