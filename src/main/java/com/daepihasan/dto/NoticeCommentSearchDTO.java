package com.daepihasan.dto;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeCommentSearchDTO {
    private Integer noticeSeq;   // 게시글 번호
    private Integer parentId;    // 부모 댓글(자식 조회용)
    private Integer page;        // 1-base
    private Integer size;        // 페이지 크기
    private Integer offset;      // (page-1)*size
    private Integer status;      // 노출/숨김
}
