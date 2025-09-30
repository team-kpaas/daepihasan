package com.daepihasan.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeCommentDTO {
    private Integer id;            // PK
    private Integer noticeSeq;     // 부모 게시물 FK
    private Integer parentId;      // 부모 댓글(null이면 루트)
    private Integer depth;         // 0부터
    private String  path;          // 정렬용 경로키(예: 0000000001/0000000007)
    private String  contents;      // 댓글 내용
    private String  userId;        // 작성자 아이디
    private Integer status;        // 0=숨김,1=노출,9=삭제
    private Boolean isDeleted;     // 소프트 삭제 여부(있다면)

    private String regId;         // 등록자(관리용)
    private LocalDateTime regDt;   // 등록일
    private String chgId;         // 수정자(관리용)
    private LocalDateTime chgDt;   // 수정일
}