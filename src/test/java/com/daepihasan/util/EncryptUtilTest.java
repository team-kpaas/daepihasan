package com.daepihasan.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class EncryptUtilTest {

    @Test
    @DisplayName("SHA256 암호화 테스트")
    void encHashSHA256() {
        System.out.println("-------------------------------------------");
        String planText = "암호화할 문자열";
        System.out.println("해시 암호화할 문자열 : " + planText);
        String hashEnc = EncryptUtil.encHashSHA256(planText);

        System.out.println("해시 암호화할 결과 : " + hashEnc);
        System.out.println("-------------------------------------------");

        assertThat(planText).isNotEqualTo(hashEnc);
    }

    @Test
    @DisplayName("SHA256 암호화 테스트")
    void encHashSHA2562() {
        System.out.println("-------------------------------------------");
        String planText = "1234";
        System.out.println("해시 암호화할 문자열 : " + planText);
        String hashEnc = EncryptUtil.encHashSHA256(planText);

        System.out.println("해시 암호화할 결과 : " + hashEnc);
        System.out.println("-------------------------------------------");

        assertThat(planText).isNotEqualTo(hashEnc);
    }

    @Test
    @DisplayName("AES128CBC 암호화 테스트")
    void encAES128CBC()
            throws InvalidAlgorithmParameterException, NoSuchPaddingException,
            IllegalBlockSizeException, NoSuchAlgorithmException, BadPaddingException, InvalidKeyException {
        System.out.println("-------------------------------------------");
        String planText = "암호화할 문자열";
        System.out.println("AES-128 암호화할 문자열 : " + planText);
        String aesEnc = EncryptUtil.encAES128CBC(planText);

        System.out.println("AES-128 암호화할 결과 : " + aesEnc);

        String aesDec = EncryptUtil.decAES128CBC(aesEnc);
        System.out.println("AES-128 복호화 결과 : " + aesDec);
        System.out.println("-------------------------------------------");

        assertThat(planText).isNotEqualTo(aesEnc);
        assertThat(planText).isEqualTo(aesDec);

    }

    @Test
    @DisplayName("AES128CBC 암호화 테스트 - 관리자 계정 DB삽입용")
    void encAES128CBC_admin()
            throws InvalidAlgorithmParameterException, NoSuchPaddingException,
            IllegalBlockSizeException, NoSuchAlgorithmException, BadPaddingException, InvalidKeyException {
        System.out.println("-------------------------------------------");
        String planText = "daepihasan@gmail.com";
        System.out.println("AES-128 암호화할 문자열 : " + planText);
        String aesEnc = EncryptUtil.encAES128CBC(planText);

        System.out.println("AES-128 암호화할 결과 : " + aesEnc);

        String aesDec = EncryptUtil.decAES128CBC(aesEnc);
        System.out.println("AES-128 복호화 결과 : " + aesDec);
        System.out.println("-------------------------------------------");

        assertThat(planText).isNotEqualTo(aesEnc);
        assertThat(planText).isEqualTo(aesDec);

    }
}