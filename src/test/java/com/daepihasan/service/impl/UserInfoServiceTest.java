package com.daepihasan.service.impl;

import com.daepihasan.dto.MailDTO;
import com.daepihasan.dto.UserInfoDTO;
import com.daepihasan.mapper.IUserInfoMapper;
import com.daepihasan.service.IMailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserInfoServiceTest {

    @Mock
    private IUserInfoMapper userInfoMapper;

    @Mock
    private IMailService mailService;

    @InjectMocks
    private UserInfoService userInfoService;

    public UserInfoServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("아이디 중복 체크 - 중복된 아이디")
    void testGetUserIdExists() throws Exception {
        UserInfoDTO pDTO = new UserInfoDTO();
        pDTO.setUserId("testUser");

        UserInfoDTO mockResult = new UserInfoDTO();
        mockResult.setExistsYn("Y");

        when(userInfoMapper.getUserIdExists(pDTO)).thenReturn(mockResult);

        UserInfoDTO result = userInfoService.getUserIdExists(pDTO);

        assertEquals("Y", result.getExistsYn());
        verify(userInfoMapper, times(1)).getUserIdExists(pDTO);
    }

    @Test
    @DisplayName("이메일 중복 체크 - 중복되지 않으면 인증번호 발송")
    void testGetEmailExists() throws Exception {
        UserInfoDTO pDTO = new UserInfoDTO();
        pDTO.setEmail("암호화된이메일");

        UserInfoDTO mockResult = new UserInfoDTO();
        mockResult.setExistsYn("N");

        when(userInfoMapper.getEmailExists(pDTO)).thenReturn(mockResult);
        when(mailService.doSendMail(any(MailDTO.class))).thenReturn(1);

        UserInfoDTO result = userInfoService.getEmailExists(pDTO);

        assertEquals("N", result.getExistsYn());
        assertTrue(result.getAuthNumber() > 0);
        verify(mailService, times(1)).doSendMail(any());
    }

    @Test
    @DisplayName("회원가입 성공 시 메일 발송과 결과 코드 확인")
    void testInsertUserInfo() throws Exception {
        UserInfoDTO pDTO = new UserInfoDTO();
        pDTO.setUserId("testUser");
        pDTO.setUserName("홍길동");
        pDTO.setPassword("암호화된패스워드");
        pDTO.setEmail("암호화된이메일");

        when(userInfoMapper.insertUserInfo(pDTO)).thenReturn(1);
        when(mailService.doSendMail(any())).thenReturn(1);

        int result = userInfoService.insertUserInfo(pDTO);

        assertEquals(1, result);  // 성공 코드 확인
        verify(mailService, times(1)).doSendMail(any());
    }

    @Test
    @DisplayName("로그인 성공 시 알림 메일 발송")
    void testGetLogin() throws Exception {
        UserInfoDTO pDTO = new UserInfoDTO();
        pDTO.setUserId("testUser");
        pDTO.setEmail("암호화된이메일");

        UserInfoDTO mockResult = new UserInfoDTO();
        mockResult.setUserId("testUser");
        mockResult.setUserName("홍길동");

        when(userInfoMapper.getLogin(pDTO)).thenReturn(mockResult);
        when(mailService.doSendMail(any())).thenReturn(1);

        UserInfoDTO result = userInfoService.getLogin(pDTO);

        assertEquals("testUser", result.getUserId());
        verify(mailService, times(1)).doSendMail(any());
    }
}