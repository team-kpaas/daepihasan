package com.daepihasan.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {
    private Integer noticeSeq;     // PK
    private String  userId;        // 작성자 아이디(VARCHAR 100)
    private Integer categoryId;    // 카테고리 FK
    private String  categoryNm;    // 조인 시 카테고리명(옵션)

    private String  title;         // 제목
    private String  contents;      // 내용(TEXT)

    private Integer readCnt;       // 조회수
    private Integer commentCnt;    // 댓글수(트리거로 관리)
    private Integer likeCnt;       // 좋아요수(집계용, 옵션)
    private Boolean likedByMe;     // 로그인 유저의 좋아요 여부(옵션)

    private Integer status;        // 0=숨김,1=노출,9=삭제
    private String regId;         // 등록자(관리용)
    private LocalDateTime regDt;   // 등록일
    private String chgId;         // 수정자(관리용)
    private LocalDateTime chgDt;   // 수정일
}