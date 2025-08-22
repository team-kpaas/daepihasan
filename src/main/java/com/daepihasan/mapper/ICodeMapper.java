package com.daepihasan.mapper;

import com.daepihasan.dto.CodeDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ICodeMapper {

    /** P_CODE_CD='001'(임야) 하위에서 CODE_NM 일치하는 소분류 코드 조회 */
    CodeDTO getSclsfCodeByName(CodeDTO pDTO);

    /** 임야(001) 하위 6자리 코드 다음 값 채번 (001001, 001002 ...) */
    String selectNextSclsfCode();

    /** CODE(소분류) 신규 추가 */
    int insertSclsfCode(CodeDTO pDTO);
}
