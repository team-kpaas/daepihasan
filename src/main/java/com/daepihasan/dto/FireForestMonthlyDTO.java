package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FireForestMonthlyDTO {
    private String yearMonth;   // 년월
    private String wdldSclsfCd; // 소분류 코드(CODE.CODE_CD)
    private String wdldSclsfNm; // 소분류명
    private String value;       // 선택한 지표 값 
}
