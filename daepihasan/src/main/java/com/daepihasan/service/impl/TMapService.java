package com.daepihasan.service.impl;

//import com.daepihasan.service.ITMapService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class TMapService implements ITMapService {
//
//    @Value("${tmap.api.key}")
//    private String tmapApiKey;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    @Override
//    public String getPedestrianRoute(double startLat, double startLon, double endLat, double endLon) {
//        String url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("appKey", tmapApiKey);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("startX", startLon);
//        body.put("startY", startLat);
//        body.put("endX",   endLon);
//        body.put("endY",   endLat);
//        body.put("reqCoordType", "WGS84GEO");
//        body.put("resCoordType", "WGS84GEO");
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
//        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//        return res.getBody();
//    }
//}
