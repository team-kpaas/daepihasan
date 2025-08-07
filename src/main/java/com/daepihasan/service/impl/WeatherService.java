package com.daepihasan.service.impl;

import com.daepihasan.dto.WeatherCacheDTO;
import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.mapper.IWeatherCacheMapper;
import com.daepihasan.service.IWeatherService;
import com.daepihasan.util.WeatherUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.daepihasan.util.WeatherUtil.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class WeatherService implements IWeatherService {

    @Value("${data.api.decodeKey}")
    private String apiKey;

    private final IWeatherCacheMapper weatherCacheMapper; // 날씨 캐시 Mapper 가져오기
    WeatherUtil weatherUtil;

    @Override
    public List<WeatherDTO> getWeather(String x, String y) {
        log.info("{}.getWeather Start!", this.getClass().getName());
        log.info("x: {}, y: {}", x, y);

        try {
            String baseDate = getBaseDate();
            String baseTime = getBaseTime();

            log.info("badeDate: {}, baseTime: {}", baseDate, baseTime);

            WeatherCacheDTO rDTO = WeatherCacheDTO.builder()
                    .x(x)
                    .y(y)
                    .baseDate(baseDate)
                    .baseTime(baseTime)
                    .build();

            // 1. 캐시 조회
            WeatherCacheDTO pDTO = getCachedWeather(rDTO);

            if (pDTO != null && pDTO.getData() != null) {
                log.info("캐시 데이터 사용");
                return parseWeather(pDTO.getData(), pDTO.getBaseTime());
            }

            // 2. API 호출 & 캐시 저장
            String json = callApiAndCache(rDTO);

            // 3. JSON → DTO 변환
            return parseWeather(json, baseTime);

        } catch (Exception e) {
            log.error("getWeather Error: ", e);
            return Collections.emptyList(); // 에러 방지를 위해서 빈 리스트 반환
        } finally {
            log.info("{}.getWeather End!", this.getClass().getName());
        }
    }

    /** 오늘 날짜 또는 어제 날짜 계산 */
    private String getBaseDate() {
        log.info("{}.getBaseDate Start!", this.getClass().getName());
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (now.getMinute() < 45) {
            now = now.minusHours(1);
            if (now.getHour() == 23) {
                today = today.minusDays(1);
            }
        }

        log.info("{}.getBaseDate End!", this.getClass().getName());

        return today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    /** 오늘 날짜 또는 어제 날짜 계산 */
    private String getBaseTime() {
        log.info("{}.getBaseTime Start!", this.getClass().getName());

        LocalTime now = LocalTime.now();

        if (now.getMinute() < 45) {
            now = now.minusHours(1);
        }

        log.info("{}.getBaseTime End!", this.getClass().getName());

        return now.format(DateTimeFormatter.ofPattern("HH")) + "30";
    }

    /** API 호출 */
    private String getJsonFromUrl(String urlStr) throws IOException {
        log.info("{}.getJsonFromUrl Start!", this.getClass().getName());
        log.debug("요청 URL: {}", urlStr); // 요청 URL 확인

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");

        BufferedReader br = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8)
        );
        StringBuilder sb = new StringBuilder();
        String line;

        while ((line = br.readLine()) != null) {
            sb.append(line);
        }

        br.close();

        String result = sb.toString();
        log.debug("API 응답값: {}", result); // 여기서 전체 JSON 응답 확인

        log.info("{}.getJsonFromUrl End!", this.getClass().getName());

        return result;
    }

    /** JSON → WeatherDTO 변환 */
    private List<WeatherDTO> parseWeather(String json, String baseTime) throws JsonProcessingException {
        log.info("{}.parseWeather Start!", this.getClass().getName());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        // 시간별로 데이터를 그룹핑
        Map<String, Map<String, String>> hourlyData = new HashMap<>();

        for (JsonNode item : items) {
            String fcstTime = item.path("fcstTime").asText();
            String category = item.path("category").asText();
            String value = item.path("fcstValue").asText();

            hourlyData.computeIfAbsent(fcstTime, k -> new HashMap<>()).put(category, value);
        }

        int baseHour = Integer.parseInt(baseTime.substring(0, 2));

        List<String> sortedKeys = hourlyData.keySet().stream()
                .sorted(Comparator.comparingInt(time -> {
                    int hour = Integer.parseInt(time.substring(0, 2));
                    return (hour - baseHour + 24) % 24;
                }))
                .toList();

        List<WeatherDTO> result = new ArrayList<>();
        for (String time : sortedKeys) {
            Map<String, String> data = hourlyData.get(time);
            String sky = data.getOrDefault("SKY", "");
            String pty = data.getOrDefault("PTY", "0");

            WeatherDTO dto = WeatherDTO.builder()
                    .time(String.valueOf(Integer.parseInt(time.substring(0, 2))))
                    .temp(data.get("T1H"))
                    .sky(sky)
                    .pty(pty)
                    .rn1(data.get("RN1"))
                    .reh(data.get("REH"))
                    .wsd(data.get("WSD"))
                    .vec(data.get("VEC"))
                    .windInfo(getWindInfo(data.get("VEC"), data.get("WSD")))
                    .lgt(data.get("LGT"))
                    .uuu(data.get("UUU"))
                    .vvv(data.get("VVV"))
                    .icon("/images/weather/" + getIcon(sky, pty))
                    .desc(getWeatherDesc(sky, pty))
                    .build();
            result.add(dto);
        }

        log.info("{}.parseWeather End!", this.getClass().getName());
        return result;
    }

    /** 캐시 조회 */
    private WeatherCacheDTO getCachedWeather(WeatherCacheDTO pDTO) throws Exception {
        log.info("{}.getCachedWeather Start!", this.getClass().getName());

        WeatherCacheDTO rDTO = weatherCacheMapper.getWeatherCache(pDTO);

        log.info("{}.getCachedWeather End!", this.getClass().getName());

        return rDTO;
    }

    /** API 호출 후 캐시 저장 (DELETE → INSERT) */
    private String callApiAndCache(WeatherCacheDTO pDTO) throws Exception {
        log.info("{}.callApiAndCache Start!", this.getClass().getName());

        String x =  pDTO.getX();
        String y = pDTO.getY();
        String baseDate =  pDTO.getBaseDate();
        String baseTime = pDTO.getBaseTime();

        String urlStr = String.format(
                "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst" +
                        "?serviceKey=%s" +
                        "&dataType=JSON" +
                        "&numOfRows=60" +
                        "&pageNo=1" +
                        "&base_date=%s" +
                        "&base_time=%s" +
                        "&nx=%s&ny=%s",
                URLEncoder.encode(apiKey, "UTF-8"), baseDate, baseTime, x, y);

        String json = getJsonFromUrl(urlStr);

        // 기존 캐시 삭제
        WeatherCacheDTO deleteDTO = WeatherCacheDTO.builder()
                .x(x)
                .y(y)
                .build();
        weatherCacheMapper.deleteWeatherCache(deleteDTO);

        // 새로운 캐시 저장
        WeatherCacheDTO saveDTO = WeatherCacheDTO.builder()
                .x(x)
                .y(y)
                .baseDate(baseDate)
                .baseTime(baseTime)
                .data(json)
                .regId("SYSTEM")
                .chgId("SYSTEM")
                .build();

        int res = weatherCacheMapper.insertWeatherCache(saveDTO);
        if (res == 1) {
            log.info("캐시 DB 저장 성공");
        } else if (res == 0){
            log.warn("캐시 DB 저장 실패");
        } else {
            log.error("캐시 DB {} 건 저장 에러", res);
        }

        log.info("{}.callApiAndCache End!", this.getClass().getName());

        return json;
    }
}