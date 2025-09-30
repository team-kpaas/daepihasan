package com.daepihasan.service.impl;

import com.daepihasan.dto.NoticeLikeDTO;
import com.daepihasan.mapper.INoticeLikeMapper;
import com.daepihasan.service.INoticeLikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeLikeService implements INoticeLikeService {
    private final INoticeLikeMapper noticeLikeMapper;

    /** 좋아요(멱등 처리: 이미 좋아요면 0 반환) */
    @Transactional
    @Override
    public int like(NoticeLikeDTO pDTO) {
        // 빠른 멱등 체크
        if (noticeLikeMapper.existsLikeByUser(pDTO) > 0) return 0;

        // 동시성 안전: PK 중복 시 DuplicateKeyException 처리
        try {
            return noticeLikeMapper.insertLike(pDTO);
        } catch (DuplicateKeyException e) {
            log.debug("already liked (duplicate key), noticeSeq={}, userId={}",
                    pDTO.getNoticeSeq(), pDTO.getUserId());
            return 0;
        }
    }

    /** 좋아요 취소(멱등 처리: 없으면 0 반환) */
    @Transactional
    @Override
    public int unlike(NoticeLikeDTO pDTO) {
        // 없어도 delete는 0을 반환
        return noticeLikeMapper.deleteLike(pDTO);
    }

    /** 게시글 좋아요 수 */
    @Transactional(readOnly = true)
    @Override
    public int getLikeCount(NoticeLikeDTO pDTO) {
        return noticeLikeMapper.countLikeByNotice(pDTO);
    }

    /** 사용자가 이미 좋아요 눌렀는지 여부 */
    @Transactional(readOnly = true)
    @Override
    public boolean hasUserLiked(NoticeLikeDTO pDTO) {
        return noticeLikeMapper.existsLikeByUser(pDTO) > 0;
    }
}
