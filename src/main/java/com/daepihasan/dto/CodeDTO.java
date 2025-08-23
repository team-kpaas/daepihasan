package com.daepihasan.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CodeDTO {
    private String codeCd;     // CODE.CODE_CD
    private String pCodeCd;    // CODE.P_CODE_CD (대분류는 null)
    private String codeNm;     // CODE.CODE_NM
    private String codeStat;   // 'Y' 사용여부
    private String regId;
    private LocalDateTime regDt;
    private String chgId;
    private LocalDateTime chgDt;
}
