package com.daepihasan.service.impl;

import com.daepihasan.dto.FireFacilityBBoxDTO;
import com.daepihasan.dto.FireFacilityDTO;
import com.daepihasan.dto.FireFacilityItemDTO;
import com.daepihasan.mapper.IFireFacilityMapper;
import com.daepihasan.service.IFireFacilityService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FireFacilityService implements IFireFacilityService {

    private final IFireFacilityMapper mapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper om = new ObjectMapper();

    @Value("${fire.api.base}")
    private String apiBase;

    @Value("${fire.api.key}")
    private String serviceKeyRaw; // properties에 들어있는 Decoding Key (원본)

    private String serviceKey; // URL 인코딩된 키 저장

    private final int rows = 100;
    private final int maxPages = 2000;

    @PostConstruct
    public void init() {
        // 시작 시 한 번만 인코딩
        this.serviceKey = URLEncoder.encode(serviceKeyRaw, StandardCharsets.UTF_8);
        log.info("[API CONF] baseHost={} key(raw)={} key(encoded)={}",
                java.net.URI.create(apiBase).getHost(),
                mask(serviceKeyRaw), mask(serviceKey));
    }

    private String mask(String k) {
        if (k == null) return "null";
        if (k.length() < 10) return k;
        return k.substring(0, 6) + "****" + k.substring(k.length() - 4);
    }

    @Override
    @Transactional
    public int ingestAll() {
        int total = 0;
        int page = 1;

        while (true) {
            var list = fetchPage(page, rows);
            if (list.isEmpty()) {
                log.info("[INGEST] page={} empty -> stop", page);
                break;
            }

            int up = mapper.upsertFireFacilityBulk(list);
            total += up;
            log.info("[INGEST] page={} fetched={} upserted={} acc={}",
                    page, list.size(), up, total);

            // 마지막 페이지 조건
            if (list.size() < rows) {
                log.info("[INGEST] last page detected (page={})", page);
                break;
            }

            page++;

            // API 서버 과부하 방지 → 살짝 딜레이
            try { Thread.sleep(200); } catch (InterruptedException ignored) {}
        }

        log.info("[INGEST] done. total {} rows", total);
        return total;
    }


    @Override
    public List<FireFacilityItemDTO> findFacilitiesInBBox(FireFacilityBBoxDTO cond) {
        return mapper.findFacilitiesInBBox(cond);
    }

    @Override
    public List<FireFacilityDTO> fetchPage(int pageNo, int numOfRows) {
        String url = UriComponentsBuilder.fromHttpUrl(apiBase)
                .queryParam("serviceKey", serviceKey)  // 위 키 그대로 (추가 인코딩해도 무방)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows)
                .queryParam("type", "json")
                .toUriString();

        String raw;
        try {
            raw = restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            log.warn("[FETCH] http error page={} err={}", pageNo, e.toString());
            return List.of();
        }

        if (raw == null || raw.isBlank()) {
            log.warn("[FETCH] empty response (pageNo={}, rows={})", pageNo, numOfRows);
            return List.of();
        }

        try {
            JsonNode root = om.readTree(raw);
            String resultCode = root.path("response").path("header").path("resultCode").asText(null);
            String resultMsg = root.path("response").path("header").path("resultMsg").asText(null);
            if (resultCode != null && !"00".equals(resultCode)) {
                log.warn("[FETCH] page={} API error code={} msg={}", pageNo, resultCode, resultMsg);
                return List.of();
            }

            JsonNode items = root.path("response").path("body").path("items");
            if (items.isMissingNode() || items.isNull()) {
                log.warn("[FETCH] items node missing. raw head={}", raw.substring(0, Math.min(raw.length(), 500)));
                return List.of();
            }

            List<JsonNode> nodes = new ArrayList<>();
            if (items.isArray()) {
                items.forEach(nodes::add);
            } else if (items.has("item")) {
                JsonNode item = items.get("item");
                if (item.isArray()) item.forEach(nodes::add);
                else if (!item.isMissingNode() && !item.isNull()) nodes.add(item);
            } else if (items.isObject()) {
                nodes.add(items);
            }

            List<FireFacilityDTO> list = new ArrayList<>(nodes.size());
            for (JsonNode n : nodes) {
                FireFacilityDTO d = new FireFacilityDTO();

                // 시설번호
                d.setFacilityNo(anyText(n,
                        "시설번호", "FCLTY_NO", "fcltyNo"));

                // 이름(상세위치/도로명/지번 중 우선순위)
                d.setName(anyText(n,
                        "상세위치", "DESC_LC", "descLc",
                        "소재지도로명주소", "RDNMADR", "rdnmadr",
                        "lnmadr"  // 지번주소
                ));

                // 시설유형코드
                d.setFacilityTypeCd(anyText(n,
                        "시설유형코드", "FCLTY_SE_CODE", "fcltySeCode"));

                // 관할기관명/전화
                d.setMngInstNm(anyText(n,
                        "관할기관명", "INSTITUTION_NM", "institutionNm"));
                d.setMngInstTel(anyText(n,
                        "관할기관전화번호", "INSTITUTION_PHONE_NUMBER", "institutionPhoneNumber"));

                // 설치연도
                d.setInstallYear(anyInt(n,
                        "설치연도", "INSTALLATION_YEAR", "installationYear"));

                // 좌표
                Double lat = anyDouble(n, "위도", "LATITUDE", "latitude");
                Double lon = anyDouble(n, "경도", "LONGITUDE", "longitude");

                // 필수값 체크
                if (isBlank(d.getFacilityNo()) || lat == null || lon == null) continue;
                if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

                d.setLat(lat);
                d.setLon(lon);

                if (isBlank(d.getName())) d.setName("소방용수시설");

                // (선택) 공백 정리
                if (d.getFacilityTypeCd() != null) d.setFacilityTypeCd(d.getFacilityTypeCd().trim());
                if (d.getFacilityNo() != null) d.setFacilityNo(d.getFacilityNo().trim());

                list.add(d);
            }

            log.debug("[FETCH] page={} parsed {} rows", pageNo, list.size());
            return list;
        } catch (Exception e) {
            log.warn("[FETCH] parse error pageNo={}: {} | raw head={}",
                    pageNo, e.toString(), raw.substring(0, Math.min(raw.length(), 500)));
            return List.of();
        }
    }
    @Override
    @Transactional
    public int ingestRange(int from, int to, int size) {
        int total = 0;

        // 파라미터 가드
        if (from < 1) from = 1;
        if (to < from) to = from;
        if (size <= 0) size = 100;
        if (size > 1000) size = 1000; // 과도한 페이지 크기 방지

        for (int p = from; p <= to; p++) {
            List<FireFacilityDTO> list = fetchPage(p, size);
            if (list.isEmpty()) {
                log.info("[INGEST-RANGE] page={} empty -> stop", p);
                break;
            }
            int up = mapper.upsertFireFacilityBulk(list);
            total += up;
            log.info("[INGEST-RANGE] page={} fetched={} upserted={} acc={}", p, list.size(), up, total);

            // 마지막 페이지 추정
            if (list.size() < size) {
                log.info("[INGEST-RANGE] page={} seems last ({} < {}), stop", p, list.size(), size);
                break;
            }

            try { Thread.sleep(120); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
        }
        return total;
    }
    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private String anyText(JsonNode n, String... keys) {
        for (String k : keys) {
            JsonNode v = n.get(k);
            if (v != null && !v.isNull() && !v.asText().isBlank()) return v.asText();
        }
        return null;
    }
    private Integer anyInt(JsonNode n, String... keys) {
        for (String k : keys) {
            String s = anyText(n, k);
            if (!isBlank(s)) {
                try { return Integer.parseInt(s.replaceAll("[^0-9-]", "")); } catch (Exception ignore) {}
            }
        }
        return null;
    }
    private Double anyDouble(JsonNode n, String... keys) {
        for (String k : keys) {
            String s = anyText(n, k);
            if (!isBlank(s)) {
                try {
                    String cleaned = s.replaceAll("[^0-9.\\-]", "");
                    if (!cleaned.isEmpty()) return Double.valueOf(cleaned);
                } catch (Exception ignore) {}
            }
        }
        return null;
    }
}
