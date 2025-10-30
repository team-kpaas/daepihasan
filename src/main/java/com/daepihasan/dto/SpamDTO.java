package com.daepihasan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class SpamDTO {

    private String text;     // 파라미터
    private String label;     // "pos" 또는 "neg" 등
    private Double score;     // 0~1 사이 점수
    private String score_str; // 문자열 버전

}

