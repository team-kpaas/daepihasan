package com.daepihasan.service.impl;

import com.daepihasan.dto.NoticeCommentDTO;
import com.daepihasan.dto.NoticeCommentSearchDTO;
import com.daepihasan.mapper.INoticeCommentMapper;
import com.daepihasan.service.INoticeCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeCommentService implements INoticeCommentService {
    private final INoticeCommentMapper commentMapper;

    @Transactional
    @Override
    public int addComment(NoticeCommentDTO pDTO) {
        return commentMapper.insertComment(pDTO);
    }

    @Transactional
    @Override
    public int updateComment(NoticeCommentDTO pDTO) {
        return commentMapper.updateComment(pDTO);
    }

    @Transactional
    @Override
    public int softDeleteComment(NoticeCommentDTO pDTO) {
        return commentMapper.softDeleteComment(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public List<NoticeCommentDTO> getCommentsByNotice(NoticeCommentSearchDTO pDTO) {
        return commentMapper.selectCommentsByNotice(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public int countCommentsByNotice(NoticeCommentSearchDTO pDTO) {
        return commentMapper.countCommentsByNotice(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public NoticeCommentDTO getCommentById(NoticeCommentDTO pDTO) {
        return commentMapper.selectCommentById(pDTO);
    }
}
