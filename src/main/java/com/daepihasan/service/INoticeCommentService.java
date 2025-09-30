package com.daepihasan.service;

import com.daepihasan.dto.NoticeCommentDTO;
import com.daepihasan.dto.NoticeCommentSearchDTO;

import java.util.List;

public interface INoticeCommentService {
    /** 댓글 등록 (트리거로 PATH/DEPTH 자동 구성) */
    int addComment(NoticeCommentDTO pDTO);

    int updateComment(NoticeCommentDTO pDTO);

    int softDeleteComment(NoticeCommentDTO pDTO);

    List<NoticeCommentDTO> getCommentsByNotice(NoticeCommentSearchDTO pDTO);

    int countCommentsByNotice(NoticeCommentSearchDTO pDTO);

    NoticeCommentDTO getCommentById(NoticeCommentDTO pDTO);}
