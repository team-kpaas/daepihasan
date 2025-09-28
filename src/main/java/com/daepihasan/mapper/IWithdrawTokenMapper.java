package com.daepihasan.mapper;

import com.daepihasan.dto.WithdrawTokenDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IWithdrawTokenMapper {
    // 신규 토큰 저장 (필수: userId, tokenHash, expiresAt, regId)
    int insertToken(WithdrawTokenDTO p) throws Exception;

    // 동일 사용자 기존 PENDING 토큰 무효화 (필수: userId, chgId)
    int invalidateOldTokens(WithdrawTokenDTO p) throws Exception;

    // 토큰 단건 조회 (필수: tokenHash)
    WithdrawTokenDTO getTokenByHash(WithdrawTokenDTO p) throws Exception;

    // 토큰 사용 처리 (필수: tokenHash, chgId)
    int markTokenUsed(WithdrawTokenDTO p) throws Exception;

    // 배치로 만료 처리 (옵션: chgId)
    int markTokenExpiredBatch(WithdrawTokenDTO p) throws Exception;
}
