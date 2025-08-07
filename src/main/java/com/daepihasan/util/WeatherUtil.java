package com.daepihasan.util;

public class WeatherUtil {

    /**
     * 강수 유형 및 하늘 상태에 따라 날씨 아이콘 반환
     */
    public static String getIcon(String sky, String pty) {
        if (!"0".equals(pty)) {
            return switch (pty) {
                case "1" -> "rain.svg";
                case "2" -> "rain_snow.svg";
                case "3" -> "snow.svg";
                case "4" -> "shower.svg";
                case "5" -> "light_rain.svg";
                case "6" -> "mixed_showers.svg";
                case "7" -> "snow_flurry.svg";
                default -> "unknown.svg";
            };
        }

        return switch (sky) {
            case "1" -> "sunny.svg";
            case "3" -> "cloudy.svg";
            case "4" -> "very_cloudy.svg";
            default -> "unknown.svg";
        };
    }

    /**
     * 강수 유형 및 하늘 상태에 따라 날씨 설명 반환
     */
    public static String getWeatherDesc(String sky, String pty) {
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

    /**
     * 풍향과 풍속을 해석하여 방향과 속도를 함께 표시
     * 예: "남동풍 (4.1 m/s)"
     */
    public static String getWindInfo(String vecStr, String wsdStr) {
        try {
            int vec = (int) Double.parseDouble(vecStr); // 풍향
            double wsd = Double.parseDouble(wsdStr);     // 풍속

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
