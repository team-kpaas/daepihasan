package com.daepihasan.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawTokenDTO {
    private Long id;
    private String userId;
    private String tokenPlain;   // 클라이언트로부터 받은 원본 토큰 (DB 저장 X)
    private String tokenHash;    // SHA-256 해시 (DB 저장)

    /**
     * status 값 설명
     * PENDING  : 발급 후 아직 사용되지 않고 만료 전인 상태(유효)
     * USED     : 이미 사용되어 처리 완료된 상태(재사용 불가)
     * INVALID  : 새 토큰 발급 등으로 기존 토큰을 강제 무효화한 상태
     * EXPIRED  : 만료 시간이 지나 자연스럽게 만료된 상태
     */
    private String status;

    private String expiresAt;    // yyyy-MM-dd HH:mm:ss

    private String regId;
    private String regDt;
    private String chgId;
    private String chgDt;
}
