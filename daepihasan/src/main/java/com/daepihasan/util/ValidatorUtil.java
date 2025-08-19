package com.daepihasan.util;

import java.util.regex.Pattern;

/**
 * 입력값 유효성 검사를 위한
 * 정규식 기반 유효성 검사유틸 클래스
 * (아이디, 비밀번호, 이메일, 이름 검증 공통화)
 */
public class ValidatorUtil {

    // 정규식 패턴
    private static final String ID_REGEX = "^[a-z][a-z0-9_-]{4,19}$";  // 5~20자, 소문자로 시작
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()])[a-z\\d!@#$%^&*()]{8,20}$";  // 8~20자, 소문자+숫자+특수문자
    private static final String EMAIL_REGEX = "^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\\.[a-zA-Z]{2,3}$";
    private static final String NAME_REGEX = "^[가-힣]{2,15}$";  // 2~15자, 한글만

    /**
     * 아이디 유효성 검사
     */
    public static boolean isValidId(String userId) {
        return Pattern.matches(ID_REGEX, CmmUtil.nvl(userId));
    }

    /**
     * 비밀번호 유효성 검사
     */
    public static boolean isValidPassword(String password) {
        return Pattern.matches(PASSWORD_REGEX, CmmUtil.nvl(password));
    }

    /**
     * 이메일 유효성 검사
     */
    public static boolean isValidEmail(String email) {
        return Pattern.matches(EMAIL_REGEX, CmmUtil.nvl(email));
    }

    /**
     * 이름 유효성 검사
     */
    public static boolean isValidName(String name) {
        return Pattern.matches(NAME_REGEX, CmmUtil.nvl(name));
    }
}