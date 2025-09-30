package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeSearchDTO {
    private Integer categoryId;
    private String  keyword;     // 제목/내용 검색어
    private Integer status;      // 노출/숨김 등
    private Integer page;        // 1-base
    private Integer size;        // 페이지 크기
    private Integer offset;      // 계산용(= (page-1)*size)
    private String  orderBy;
}
