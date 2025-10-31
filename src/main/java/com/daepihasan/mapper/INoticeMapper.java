package com.daepihasan.mapper;

import com.daepihasan.dto.NoticeDTO;
import com.daepihasan.dto.NoticeSearchDTO;
import lombok.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface INoticeMapper {

    int insertNotice(NoticeDTO pDTO);

    int updateNotice(NoticeDTO pDTO);

    /**
     * 상태값(STATUS 등) 기반 소프트 삭제용
     */
    int softDeleteNotice(NoticeDTO pDTO);

    /**
     * 상세: pDTO.noticeSeq 만 채워서 전달
     */
    NoticeDTO selectNoticeDetail(NoticeDTO pDTO);
    int countNoticeList(NoticeSearchDTO pDTO);
    /**
     * 목록: 검색/정렬/페이징은 NoticeSearchDTO 사용
     */
    List<NoticeDTO> selectNoticeList(NoticeSearchDTO pDTO);

    /**
     * 조회수 +1: pDTO.noticeSeq 세팅
     */
    int increaseReadCount(NoticeDTO pDTO);
}