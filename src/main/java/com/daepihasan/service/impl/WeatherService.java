package com.daepihasan.service.impl;

import com.daepihasan.dto.WeatherCacheDTO;
import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.mapper.IWeatherCacheMapper;
import com.daepihasan.service.IWeatherService;
import com.daepihasan.util.NetworkUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.daepihasan.util.WeatherUtil.*;
import static java.nio.charset.StandardCharsets.UTF_8;

@Slf4j
@RequiredArgsConstructor
@Service
public class WeatherService implements IWeatherService {

    @Value("${data.api.decodeKey}")   // 1차(기존) API KEY
    private String apiKey;

    @Value("${kma.api.decodeKey}")    // 2차(KMA) API KEY
    private String kmaApiKey;

    private final IWeatherCacheMapper weatherCacheMapper; // 날씨 캐시 Mapper 가져오기

    /**
     * 격자 좌표(x, y)를 기반으로 기상청 초단기예보 API를 호출하여 날씨 정보를 조회한다.
     * 1. 주어진 좌표의 캐시 내역을 확인
     * 2. 캐시가 없거나 유효하지 않은 경우 기상청 API 호출
     * 3. 받아온 데이터를 DB에 캐시로 저장 후 가공하여 반환
     *
     * @param pDTO 격자 x,y 좌표를 가지고 있는 DTO
     * @return 시간대별 날씨 정보 리스트(6시간)
     */
    @Override
    public WeatherCacheDTO getWeather(WeatherCacheDTO pDTO, String ssUserId) {
        log.info("{}.getWeather Start!", this.getClass().getName());
        String lat = pDTO.getLat();
        String lng = pDTO.getLng();

        Map<String, Integer> xy = toXY(Double.parseDouble(lat), Double.parseDouble(lng));
        Integer x =  xy.get("x");
        Integer y =  xy.get("y");

        log.info("x: {}, y: {}", x, y);

        try {
            String baseDate = getBaseDate();
            String baseTime = getBaseTime();

            log.info("badeDate: {}, baseTime: {}", baseDate, baseTime);

            WeatherCacheDTO rDTO = WeatherCacheDTO.builder()
                    .x(x)
                    .y(y)
                    .lat(lat)
                    .lng(lng)
                    .baseDate(baseDate)
                    .baseTime(baseTime)
                    .build();

            // 1. 캐시 조회
            WeatherCacheDTO cDTO = getCachedWeather(rDTO);

            if (cDTO != null && cDTO.getData() != null) {
                log.info("캐시 데이터 사용");
                return parseWeather(cDTO.getData(), cDTO.getBaseTime());
            }

            // 2. API 호출 & 캐시 저장
            String json = callApiAndCache(rDTO, ssUserId);

            // 3. JSON → DTO 변환
            return parseWeather(json, baseTime);

        } catch (Exception e) {
            log.error("getWeather Error: ", e);
            return WeatherCacheDTO.builder().weatherList(Collections.emptyList()).build(); // 에러 방지를 위해서 빈 리스트 반환
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

    /** JSON → WeatherDTO 변환 */
    private WeatherCacheDTO parseWeather(String json, String baseTime) throws JsonProcessingException {
        log.info("{}.parseWeather Start!", this.getClass().getName());

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> root = mapper.readValue(json, LinkedHashMap.class);

        Map<String, Object> response = (Map<String, Object>) root.get("response");
        Map<String, Object> body     = (Map<String, Object>) response.get("body");
        Map<String, Object> items    = (Map<String, Object>) body.get("items");
        List<Map<String, Object>> itemList = (List<Map<String, Object>>) items.get("item");

        Map<String, Map<String, String>> hourlyData = new LinkedHashMap<>();
        for (Map<String, Object> it : itemList) {
            String fcstTime = String.valueOf(it.get("fcstTime"));
            String category = String.valueOf(it.get("category"));
            String value    = String.valueOf(it.get("fcstValue"));

            hourlyData.computeIfAbsent(fcstTime, k -> new LinkedHashMap<>())
                    .put(category, value);
        }

        int baseHour = Integer.parseInt(baseTime.substring(0, 2));
        List<String> sortedKeys = hourlyData.keySet().stream()
                .sorted(Comparator.comparingInt(t -> {
                    int hour = Integer.parseInt(t.substring(0, 2));
                    return (hour - baseHour + 24) % 24;
                }))
                .toList();

        List<WeatherDTO> list = new ArrayList<>();
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
            list.add(dto);
        }

        log.info("{}.parseWeather End!", this.getClass().getName());

        // WeatherCacheDTO에 세팅해서 반환
        return WeatherCacheDTO.builder()
                .weatherList(list)
                .build();
    }

    /** 캐시 조회 */
    private WeatherCacheDTO getCachedWeather(WeatherCacheDTO pDTO) throws Exception {
        log.info("{}.getCachedWeather Start!", this.getClass().getName());

        WeatherCacheDTO rDTO = weatherCacheMapper.getWeatherCache(pDTO);

        log.info("{}.getCachedWeather End!", this.getClass().getName());

        return rDTO;
    }

    /** API 호출 후 캐시 저장 (DELETE → INSERT) */
    private String callApiAndCache(WeatherCacheDTO pDTO, String ssUserId) throws Exception {
        log.info("{}.callApiAndCache Start!", this.getClass().getName());

        Integer x =  pDTO.getX();
        Integer y = pDTO.getY();
        String baseDate =  pDTO.getBaseDate();
        String baseTime = pDTO.getBaseTime();

        // 공통 파라미터
        String primaryParam = buildApiParam(apiKey, x, y, baseDate, baseTime);
        String kmaParam     = buildApiParamForKma(kmaApiKey, x, y, baseDate, baseTime); // KMA가 authKey 등을 쓴다면 별도 함수

        String primaryUrl = apiURL + primaryParam;
        String kmaUrl     = kmaApiURL + kmaParam;
        String json = "";

        try {
            log.info("1차 API 요청: {}", primaryUrl);
            json = NetworkUtil.get(primaryUrl);
            if (!isValidResponse(json)) throw new IllegalStateException("1차 응답 비정상");
            log.info("1차 API 성공");
        } catch (Exception ex) {
            log.warn("1차 API 실패({}) → KMA 요청 시도", ex.toString());
            json = NetworkUtil.get(kmaApiURL);
            if (!isValidResponse(json)) {
                log.error("기상청 요청도 실패");
                throw new IllegalStateException("모든 단기 날씨 api 요청 실패");
            }
            log.info("KMA API 성공");
        }

        // 1. 기존 캐시 삭제
        WeatherCacheDTO deleteDTO = WeatherCacheDTO.builder()
                .x(x)
                .y(y)
                .build();
        weatherCacheMapper.deleteWeatherCache(deleteDTO);

        // 2. 새로운 캐시 저장
        WeatherCacheDTO saveDTO = WeatherCacheDTO.builder()
                .x(x)
                .y(y)
                .lat(pDTO.getLat())
                .lng(pDTO.getLng())
                .baseDate(baseDate)
                .baseTime(baseTime)
                .data(json)
                .regId((ssUserId != null) ? ssUserId : "GUEST")
                .chgId((ssUserId != null) ? ssUserId : "GUEST")
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

    /** 공통 파라미터 생성 */
    private String buildApiParamForKma(String key, Integer x, Integer y, String baseDate, String baseTime) {
        return String.format(
                "?authKey=%s" +
                        "&dataType=JSON" +
                        "&numOfRows=60" +
                        "&pageNo=1" +
                        "&base_date=%s" +
                        "&base_time=%s" +
                        "&nx=%s&ny=%s",
                URLEncoder.encode(apiKey, UTF_8), baseDate, baseTime, x, y);
    }

    private String buildApiParam(String key, Integer x, Integer y, String baseDate, String baseTime) {
        return String.format(
                "?serviceKey=%s" +
                        "&dataType=JSON" +
                        "&numOfRows=60" +
                        "&pageNo=1" +
                        "&base_date=%s" +
                        "&base_time=%s" +
                        "&nx=%s&ny=%s",
                URLEncoder.encode(apiKey, UTF_8), baseDate, baseTime, x, y);
    }

    private boolean isValidResponse(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> root = mapper.readValue(json, LinkedHashMap.class);

            Map<String, Object> response = (Map<String, Object>) root.get("response");
            if (response == null) return false;

            Map<String, Object> header = (Map<String, Object>) response.get("header");
            if (header != null) {
                String code = String.valueOf(header.get("resultCode"));
                // 정상코드: "00" 또는 "0000"
                if (!"00".equals(code) && !"0000".equals(code)) return false;
            }

            Map<String, Object> body = (Map<String, Object>) response.get("body");
            Map<String, Object> items = body == null ? null : (Map<String, Object>) body.get("items");
            List<?> list = items == null ? null : (List<?>) items.get("item");
            return list != null && !list.isEmpty();
        } catch (Exception e) {
            log.warn("응답 유효성 검사 실패: {}", e.toString());
            return false;
        }
    }


}