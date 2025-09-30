package com.daepihasan.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

public class WithdrawTokenUtil {

    private static final String HMAC_ALG = "HmacSHA256";

    /**
     * 토큰 생성
     * 구조: base64Url(payload).base64Url(signature)
     * payload: userInfoId|expiryEpochMillis|nonce
     */
    public static String createToken(long userInfoId, long ttlMillis, String secret) {
        long exp = Instant.now().toEpochMilli() + ttlMillis;
        String nonce = UUID.randomUUID().toString().replace("-", "");
        String payload = userInfoId + "|" + exp + "|" + nonce;
        String payloadEnc = base64Url(payload.getBytes(StandardCharsets.UTF_8));
        String sig = base64Url(hmac(payloadEnc, secret));
        return payloadEnc + "." + sig;
    }

    /**
     * 토큰 검증
     * 서명, 구조, 만료시간 검증 후 userInfoId(Long) 반환, 실패 시 null
     */
    public static Long verifyAndGetUserInfoId(String token, String secret) {
        if (token == null || !token.contains(".")) return null;

        String[] parts = token.split("\\.", 2);
        String payloadEnc = parts[0];
        String sig = parts[1];

        // 서명 검증
        String expected = base64Url(hmac(payloadEnc, secret));
        if (!constantTimeEquals(sig, expected)) return null;

        // payload 파싱
        String payload = new String(Base64.getUrlDecoder().decode(payloadEnc), StandardCharsets.UTF_8);
        String[] p = payload.split("\\|");
        if (p.length != 3) return null;

        long userInfoId;
        long exp;
        try {
            userInfoId = Long.parseLong(p[0]);
            exp = Long.parseLong(p[1]);
        } catch (NumberFormatException e) {
            return null;
        }

        // 만료 체크
        if (Instant.now().toEpochMilli() > exp) return null;

        return userInfoId;
    }

    /* ================== 내부 유틸 ================== */

    private static byte[] hmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALG);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALG));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC 생성 실패", e);
        }
    }

    private static String base64Url(byte[] b) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int r = 0;
        for (int i = 0; i < a.length(); i++) {
            r |= a.charAt(i) ^ b.charAt(i);
        }
        return r == 0;
    }

    private WithdrawTokenUtil() {}
}
