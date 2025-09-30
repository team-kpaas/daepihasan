package com.daepihasan.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeCategoryDTO {
    private Integer id;            // PK
    private String  categoryNm;    // 카테고리명
    private Integer prtOrd;        // 노출 순서
    private Integer status;        // 0=숨김,1=노출

    private String regId;
    private LocalDateTime regDt;
    private String chgId;
    private LocalDateTime chgDt;
}