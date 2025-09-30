package com.daepihasan.service.impl;

import com.daepihasan.dto.NoticeDTO;
import com.daepihasan.dto.NoticeSearchDTO;
import com.daepihasan.mapper.INoticeMapper;
import com.daepihasan.service.INoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {
    private final INoticeMapper noticeMapper;

    @Transactional
    @Override
    public int createNotice(NoticeDTO pDTO) {
        return noticeMapper.insertNotice(pDTO);
    }

    @Transactional
    @Override
    public int updateNotice(NoticeDTO pDTO) {
        return noticeMapper.updateNotice(pDTO);
    }

    @Transactional
    @Override
    public int softDeleteNotice(NoticeDTO pDTO) {
        return noticeMapper.softDeleteNotice(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public NoticeDTO getNoticeDetail(NoticeDTO pDTO) {
        return noticeMapper.selectNoticeDetail(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public List<NoticeDTO> getNoticeList(NoticeSearchDTO pDTO) {
        return noticeMapper.selectNoticeList(pDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public int countNotices(NoticeSearchDTO pDTO) {
        return noticeMapper.countNoticeList(pDTO);
    }

    @Transactional
    @Override
    public int increaseReadCount(NoticeDTO pDTO) {
        return noticeMapper.increaseReadCnt(pDTO);
    }
}
