package com.daepihasan.service;

import com.daepihasan.dto.NoticeLikeDTO;

public interface INoticeLikeService {
    int like(NoticeLikeDTO pDTO);

    /** 좋아요 취소 */
    int unlike(NoticeLikeDTO pDTO);

    /** 게시글 좋아요 수 */
    int getLikeCount(NoticeLikeDTO pDTO);

    /** 사용자가 이미 좋아요 눌렀는지 여부 */
    boolean hasUserLiked(NoticeLikeDTO pDTO);
}
