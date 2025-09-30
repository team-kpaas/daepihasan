package com.daepihasan.service;

import com.daepihasan.dto.NoticeCategoryDTO;

import java.util.List;

public interface INoticeCategoryService {
    /** 카테고리 등록 */
    int createCategory(NoticeCategoryDTO pDTO);

    /** 카테고리 수정 */
    int updateCategory(NoticeCategoryDTO pDTO);

    /** 카테고리 삭제 */
    int deleteCategory(NoticeCategoryDTO pDTO);

    /** 카테고리 목록 조회(정렬 포함) */
    List<NoticeCategoryDTO> getCategoryList(NoticeCategoryDTO pDTO);
}
