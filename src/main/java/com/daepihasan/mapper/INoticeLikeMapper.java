package com.daepihasan.mapper;

import com.daepihasan.dto.NoticeLikeDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface INoticeLikeMapper {

    /** 좋아요 추가: NOTICE_SEQ, USER_ID */
    int insertLike(NoticeLikeDTO pDTO);
    int deleteLike(NoticeLikeDTO pDTO);
    int countLikeByNotice(NoticeLikeDTO pDTO);
    int existsLikeByUser(NoticeLikeDTO pDTO);
}