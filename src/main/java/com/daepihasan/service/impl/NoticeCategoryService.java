package com.daepihasan.service.impl;

import com.daepihasan.dto.NoticeCategoryDTO;
import com.daepihasan.mapper.INoticeCategoryMapper;
import com.daepihasan.service.INoticeCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeCategoryService implements INoticeCategoryService {
    private final INoticeCategoryMapper noticeCategoryMapper;

    /** 카테고리 등록 */
    @Transactional
    @Override
    public int createCategory(NoticeCategoryDTO pDTO) {
        return noticeCategoryMapper.insertCategory(pDTO);
    }

    /** 카테고리 수정 */
    @Transactional
    @Override
    public int updateCategory(NoticeCategoryDTO pDTO) {
        return noticeCategoryMapper.updateCategory(pDTO);
    }

    /** 카테고리 삭제(소프트 삭제 권장: STATUS=9) */
    @Transactional
    @Override
    public int deleteCategory(NoticeCategoryDTO pDTO) {
        // 소프트 삭제를 사용한다면:
        return noticeCategoryMapper.deleteCategory(pDTO);
        // 물리 삭제가 필요하면 아래 메서드를 매퍼에 두고 교체:
        // return noticeCategoryMapper.deleteCategory(pDTO);
    }

    /** 카테고리 목록 조회(정렬 포함) */
    @Transactional(readOnly = true)
    @Override
    public List<NoticeCategoryDTO> getCategoryList(NoticeCategoryDTO pDTO) {
        return noticeCategoryMapper.selectCategoryList(pDTO);
    }
}
