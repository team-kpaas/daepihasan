package com.daepihasan.service;

import com.daepihasan.dto.NoticeDTO;
import com.daepihasan.dto.NoticeSearchDTO;

import java.util.List;

public interface INoticeService {
    int createNotice(NoticeDTO pDTO);

    int updateNotice(NoticeDTO pDTO);

    int softDeleteNotice(NoticeDTO pDTO);

    NoticeDTO getNoticeDetail(NoticeDTO pDTO);

    List<NoticeDTO> getNoticeList(NoticeSearchDTO pDTO);

    int countNotices(NoticeSearchDTO pDTO);

    int increaseReadCount(NoticeDTO pDTO);
}
