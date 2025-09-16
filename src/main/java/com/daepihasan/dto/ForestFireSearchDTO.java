package com.daepihasan.dto;

import lombok.*;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ForestFireSearchDTO {
    private String provinceCd;           // 시도 코드 (예: 31, 37)
}
