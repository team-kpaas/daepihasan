package com.daepihasan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/*
 * DTO를 JSON 형태로 변환할 때, 값이 기본값(빈값, 초기화값)이 아닌 변수만 JSON 형태로 변환
 * */
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class MsgDTO {

    private int result; // 성공 : 1 / 실패 : 그 외
    private String msg; // 메시지
}
