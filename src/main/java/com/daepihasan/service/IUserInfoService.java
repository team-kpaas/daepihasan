package com.daepihasan.service;

import com.daepihasan.dto.UserInfoDTO;
import com.daepihasan.dto.WithdrawTokenDTO;

public interface IUserInfoService {
    // 아이디 중복 체크
    UserInfoDTO getUserIdExists(UserInfoDTO pDTO) throws Exception;

    // 이메일 주소 중복 체크 및 인증 값
    UserInfoDTO getEmailExists(UserInfoDTO pDTO) throws Exception;

    // 회원 가입하기(회원정보 등록하기)
    int insertUserInfo(UserInfoDTO pDTO) throws Exception;

    // 로그인을 위해 아이디와 비밀번호가 일치하는지 확인하기
    UserInfoDTO getLogin(UserInfoDTO pDTO) throws Exception;

    // 아이디, 비밀번호 찾기
    UserInfoDTO searchUserIdOrPasswordProc(UserInfoDTO pDTO) throws Exception;

    // 비밀번호 재설정
    int newPasswordProc(UserInfoDTO pDTO) throws Exception;

    // 회원 탈퇴
    // 비밀번호 재확인
    int confirmPassword(UserInfoDTO pDTO) throws Exception;

    // 탈퇴 토큰 메일 발송
    int requestWithdrawLink(UserInfoDTO pDTO) throws Exception;

    // 토큰 검증 및 탈퇴 실행
    int executeWithdrawByToken(WithdrawTokenDTO pDTO) throws Exception;

    int updateAddress(UserInfoDTO pDTO) throws Exception;

    UserInfoDTO getUserDetail(UserInfoDTO pDTO) throws Exception;
}


