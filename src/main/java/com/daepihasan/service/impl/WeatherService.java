package com.daepihasan.service.impl;

import com.daepihasan.dto.WeatherDTO;
import com.daepihasan.service.IWeatherService;
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

@Slf4j
@RequiredArgsConstructor
@Service
public class WeatherService implements IWeatherService {

    @Value("${data.api.key}")
    private String apiKey;

    @Override
    public List<WeatherDTO> getWeather(String x, String y) {
        log.info("{}.getWeather Start!", this.getClass().getName());

        try {
            String baseDate = getBaseDate();
            String baseTime = getBaseTime();

            String urlStr = String.format(
                    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst" +
                            "?serviceKey=%s" +
                            "&dataType=JSON" +
                            "&numOfRows=60" +
                            "&pageNo=1" +
                            "&base_date=%s" +
                            "&base_time=%s" +
                            "&nx=%s&ny=%s",
                    URLEncoder.encode(apiKey, "UTF-8"), baseDate, baseTime, x, y
            );

            String response = getJsonFromUrl(urlStr);
            return parseWeather(response, baseTime);

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        } finally {
            log.info("{}.getWeather End!", this.getClass().getName());
        }
    }

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

    private String getBaseTime() {
        log.info("{}.getBaseTime Start!", this.getClass().getName());

        LocalTime now = LocalTime.now();

        if (now.getMinute() < 45) {
            now = now.minusHours(1);
        }

        log.info("{}.getBaseTime End!", this.getClass().getName());

        return now.format(DateTimeFormatter.ofPattern("HH")) + "30";
    }

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

    private String getIcon(String sky, String pty) {
        if (!"0".equals(pty)) {
            return switch (pty) {
                case "1" -> "rain.png";
                case "2" -> "rain_snow.png";
                case "3" -> "snow.png";
                case "4" -> "shower.png";
                case "5" -> "light_rain.png";
                case "6" -> "mixed_showers.png";
                case "7" -> "snow_flurry.png";
                default -> "unknown.png";
            };
        }
        return switch (sky) {
            case "1" -> "sunny.png";
            case "3" -> "cloudy.png";
            case "4" -> "very_cloudy.png";
            default -> "unknown.png";
        };
    }

    private String getWeatherDesc(String sky, String pty) {
        if (!"0".equals(pty)) {
            return switch (pty) {
                case "1" -> "비";
                case "2" -> "비/눈";
                case "3" -> "눈";
                case "4" -> "소나기";
                case "5" -> "빗방울";
                case "6" -> "빗방울눈날림";
                case "7" -> "눈날림";
                default -> "강수";
            };
        }
        return switch (sky) {
            case "1" -> "맑음";
            case "3" -> "구름많음";
            case "4" -> "흐림";
            default -> "정보없음";
        };
    }

    private String getWindInfo(String vecStr, String wsdStr) {
        try {
            int vec = (int) Double.parseDouble(vecStr); // 예: "135.0" → 135
            double wsd = Double.parseDouble(wsdStr);     // 예: "4.1"   → 4.1

            String direction;
            if (vec >= 337.5 || vec < 22.5) {
                direction = "북풍";
            } else if (vec < 67.5) {
                direction = "북동풍";
            } else if (vec < 112.5) {
                direction = "동풍";
            } else if (vec < 157.5) {
                direction = "남동풍";
            } else if (vec < 202.5) {
                direction = "남풍";
            } else if (vec < 247.5) {
                direction = "남서풍";
            } else if (vec < 292.5) {
                direction = "서풍";
            } else {
                direction = "북서풍";
            }

            return String.format("%s (%.1f m/s)", direction, wsd);

        } catch (NumberFormatException e) {
            return "정보없음";
        }
    }

}