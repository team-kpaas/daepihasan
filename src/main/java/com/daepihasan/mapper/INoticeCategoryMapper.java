package com.daepihasan.mapper;

import com.daepihasan.dto.NoticeCategoryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface INoticeCategoryMapper {

    int insertCategory(NoticeCategoryDTO pDTO);

    int updateCategory(NoticeCategoryDTO pDTO);

    int deleteCategory(NoticeCategoryDTO pDTO);

    List<NoticeCategoryDTO> selectCategoryList(NoticeCategoryDTO pDTO);
}