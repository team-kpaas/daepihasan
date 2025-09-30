package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeLikeDTO {
    private Integer noticeSeq;     // 글 PK
    private String userId;        // 좋아요한 사용자(스키마 INT 기준)
    private Boolean liked;         // 현재 유저가 좋아요 중인지
    private Integer likeCount;     // 총 좋아요 수
}