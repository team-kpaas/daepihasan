package com.daepihasan.service.impl;

import com.daepihasan.dto.MailDTO;
import com.daepihasan.dto.MsgDTO;
import com.daepihasan.dto.UserInfoDTO;
import com.daepihasan.mapper.IUserInfoMapper;
import com.daepihasan.service.IMailService;
import com.daepihasan.service.IUserInfoService;
import com.daepihasan.util.CmmUtil;
import com.daepihasan.util.DateUtil;
import com.daepihasan.util.EncryptUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserInfoService implements IUserInfoService {

    private final IUserInfoMapper userInfoMapper; // 회원관련 SQL 사용하기 위한 Mapper 가져오기
    private final IMailService mailService; // 메일 발송을 위한 MailService 자바 객체 가져오기

    @Override
    public UserInfoDTO getUserIdExists(UserInfoDTO pDTO) throws Exception {
        log.info("{}.getUserIdExists Start!", this.getClass().getName());

        // DB 이메일이 존재하는지 SQL 쿼리 실행
        UserInfoDTO rDTO = userInfoMapper.getUserIdExists(pDTO);

        log.info("{}.getUserIdExists End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    public UserInfoDTO getEmailExists(UserInfoDTO pDTO) throws Exception {
        log.info("{}.getEmailExists Start!", this.getClass().getName());

        // DB 이메일이 존재하는지 SQL 쿼리 실행
        UserInfoDTO rDTO = Optional.ofNullable(userInfoMapper.getEmailExists(pDTO)).orElseGet(UserInfoDTO::new);

        log.info("rDTO : {}", rDTO);

        // 이메일 주소가 중복되지 않는다면.. 메일 발송
        if (CmmUtil.nvl(rDTO.getExistsYn()).equals("N")) {

            // 6자리 랜덤 숫자 생성하기
            int authNumber = ThreadLocalRandom.current().nextInt(10000, 100000);

            log.info("authNumber : {}", authNumber);

            // 인증번호 발송 로직
            MailDTO dto = new MailDTO();
            dto.setToMail(EncryptUtil.decAES128CBC(CmmUtil.nvl(pDTO.getEmail())));
            dto.setTitle("이메일 중복 확인 인증번호 발송 메일");
            dto.setContents("인증번호는 " + authNumber + " 입니다.");

            mailService.doSendMail(dto); // 이메일 발송

            dto = null;

            rDTO.setAuthNumber(authNumber); // 인증번호를 결과값에 넣어주기
        }

        log.info("{}.getEmailExists End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    public int insertUserInfo(UserInfoDTO pDTO) throws Exception {
        log.info("{}.insertUserInfo Start!", this.getClass().getName());

        // 회원가입 성공 : 1, 아이디 중복으로인한 가입 취소 : 2, 기타 에러 발생 : 0
        int res;

        // 회원가입
        int success = userInfoMapper.insertUserInfo(pDTO);

        // db에 데이터가 등록되었다면(회원가입 성공했다면....)
        if(success > 0) {
            res = 1;

            MailDTO mDTO = new MailDTO();

            // 회원정보화면에서 입력받은 이메일 변수(아직 암호화되어 넘어오기 때문에 복호화 수행)
            mDTO.setToMail(EncryptUtil.decAES128CBC(CmmUtil.nvl(pDTO.getEmail())));

            mDTO.setTitle("회원가입을 축하드립니다."); // 제목

            mDTO.setContents(CmmUtil.nvl(pDTO.getUserName()) + "님의 회원가입을 진심으로 축하드립니다.");

            mailService.doSendMail(mDTO);

        } else {
            res = 0;

            log.info("{}.insertUserInfo End!", this.getClass().getName());

            return res;
        }

        log.info("{}.insertUserInfo End!", this.getClass().getName());
        return res;
    }

    /**
     * 로그인을 위해 아이디와 비밀번호가 일치하는지 확인하기
     *
     * @param pDTO 로그인을 위한 회원아이디, 비밀번호
     * @return 로그인된 회원아이디 정보
     */
    @Override
    public UserInfoDTO getLogin(UserInfoDTO pDTO) throws Exception {

        log.info("{}.getLogin Start!", this.getClass().getName());

        // 로그인을 위해 아이디와 비밀번호가 일치하는지 확인하기 위한 mapper 호출하기
        // userInfoMapper.getUserLoginCheck(pDTO) 함수 실행 결과가 NULL 발생하면, UserInfoDTO 메모리에 올리기
        UserInfoDTO rDTO = Optional.ofNullable(userInfoMapper.getLogin(pDTO)).orElseGet(UserInfoDTO::new);

        if(!CmmUtil.nvl(rDTO.getUserId()).isEmpty()) {
            MailDTO mDTO = new MailDTO();

            // 아이디, 패스워드 일치하는지 체크하는 쿼리에서 이메일 값 받아오기(아직 암호화되어 넘어오기 때문에 복호화 수행함)
            mDTO.setToMail(EncryptUtil.decAES128CBC(CmmUtil.nvl(rDTO.getEmail())));

            mDTO.setTitle("로그인 알림!"); // 제목

            // 메일 내용에 가입자 이름 넣어서 내용을 발송
            mDTO.setContents(DateUtil.getDateTime("yyyy.MM.dd hh:mm:ss") + "에 "
                    + CmmUtil.nvl(rDTO.getUserName() + "님이 로그인했습니다."));

            // 회원 가입이 성공했으므로 메일을 발송
            mailService.doSendMail(mDTO);
        }

        log.info("{}.getLogin End!", this.getClass().getName());

        return rDTO;
    }

    // 아이디, 비밀번호 찾기
    @Override
    public UserInfoDTO searchUserIdOrPasswordProc(UserInfoDTO pDTO) throws Exception {
        log.info("{}.searchUserIdOrPasswordProc Start!", this.getClass().getName());

        UserInfoDTO rDTO = userInfoMapper.getUserId(pDTO);

        log.info("{}.searchUserIdOrPasswordProc End!", this.getClass().getName());

        return rDTO;
    }

    // 새 비밀번호, 확인 비밀번호 일치여부 검증
    @Override
    public MsgDTO checkPasswordMatch(String password, String password2) {
        MsgDTO dto = new MsgDTO();

        if (!password.equals(password2)) {
            dto.setResult(0);
            dto.setMsg("입력한 두 비밀번호가 일치하지 않습니다.");
        } else {
            dto.setResult(1);
        }

        return dto;
    }

    // 비밀번호 재설정
    @Override
    public int newPasswordProc(UserInfoDTO pDTO) throws Exception {
        log.info("{}.newPasswordProc Start!", this.getClass().getName());

        // 비밀번호 재설정
        int success = userInfoMapper.updatePassword(pDTO);

        log.info("{}.newPasswordProc End!", this.getClass().getName());

        return success;
    }
}
