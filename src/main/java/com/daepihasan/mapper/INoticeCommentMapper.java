package com.daepihasan.mapper;

import com.daepihasan.dto.NoticeCommentDTO;
import com.daepihasan.dto.NoticeCommentSearchDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface INoticeCommentMapper {

    /** 등록: NOTICE_SEQ, PARENT_ID(옵션), CONTENTS, REG_ID 등 */
    // INSERT: NOTICE_SEQ, (옵션)PARENT_ID, CONTENTS, REG_ID 등
    int insertComment(NoticeCommentDTO pDTO);

    // UPDATE: ID, CONTENTS, CHG_ID
    int updateComment(NoticeCommentDTO pDTO);

    // SOFT DELETE: ID, CHG_ID  (IS_DELETED=1, STATUS=9)
    int softDeleteComment(NoticeCommentDTO pDTO);

    // 목록/카운트: NOTICE_SEQ, 페이징, 정렬 등
    List<NoticeCommentDTO> selectCommentsByNotice(NoticeCommentSearchDTO pDTO);
    int countCommentsByNotice(NoticeCommentSearchDTO pDTO);

    // 단건 조회: ID
    NoticeCommentDTO selectCommentById(NoticeCommentDTO pDTO);

}