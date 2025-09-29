package com.daepihasan.service.impl;

import com.daepihasan.dto.MailDTO;
import com.daepihasan.dto.UserInfoDTO;
import com.daepihasan.dto.WithdrawTokenDTO;
import com.daepihasan.mapper.IUserInfoMapper;
import com.daepihasan.mapper.IWithdrawTokenMapper;
import com.daepihasan.service.IMailService;
import com.daepihasan.service.IUserInfoService;
import com.daepihasan.util.CmmUtil;
import com.daepihasan.util.DateUtil;
import com.daepihasan.util.EncryptUtil;
import com.daepihasan.util.WithdrawTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserInfoService implements IUserInfoService {

    private final IUserInfoMapper userInfoMapper; // 회원관련 SQL 사용하기 위한 Mapper 가져오기
    private final IWithdrawTokenMapper withdrawTokenMapper; // 회원관련 SQL 사용하기 위한 Mapper 가져오기
    private final IMailService mailService; // 메일 발송을 위한 MailService 자바 객체 가져오기

    @Value("${withdraw.token.secret}")
    private String withdrawSecret;

    @Value("${withdraw.token.ttl.millis}") // 기본 15분
    private long withdrawTtl;

    @Value("${withdraw.link.base-url}")
    private String withdrawBaseUrl;

    private static final DateTimeFormatter TOKEN_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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

    // 비밀번호 재설정
    @Override
    public int newPasswordProc(UserInfoDTO pDTO) throws Exception {
        log.info("{}.newPasswordProc Start!", this.getClass().getName());

        // 비밀번호 재설정
        int success = userInfoMapper.updatePassword(pDTO);

        log.info("{}.newPasswordProc End!", this.getClass().getName());

        return success;
    }

    @Override
    public int requestWithdrawLink(UserInfoDTO pDTO) throws Exception {
        String userId = CmmUtil.nvl(pDTO.getUserId());
        if (userId.isEmpty()) return 0;

        UserInfoDTO base = Optional.ofNullable(userInfoMapper.getUserBasicById(pDTO))
                .orElse(new UserInfoDTO());
        if (base.getUserInfoId() == null) return 0;

        // 이미 탈퇴 여부
        if (userInfoMapper.isAlreadyWithdrawn(pDTO) == 1) return 2;

        // 기존 PENDING 무효화
        WithdrawTokenDTO inv = new WithdrawTokenDTO();
        inv.setUserInfoId(base.getUserInfoId());
        inv.setChgId(userId);
        withdrawTokenMapper.invalidateOldTokens(inv);

        // 새 토큰 생성 (userInfoId 기반)
        String plain = WithdrawTokenUtil.createToken(base.getUserInfoId(), withdrawTtl, withdrawSecret);
        String hash = EncryptUtil.encHashSHA256(plain);

        WithdrawTokenDTO t = new WithdrawTokenDTO();
        t.setUserInfoId(base.getUserInfoId());
        t.setTokenHash(hash);
        t.setExpiresAt(LocalDateTime.ofInstant(
                Instant.ofEpochMilli(System.currentTimeMillis() + withdrawTtl),
                ZoneId.systemDefault()).format(TOKEN_FMT));
        t.setRegId(userId);
        withdrawTokenMapper.insertToken(t);

        String link = withdrawBaseUrl + "/user/withdraw/execute?token=" + plain;

        MailDTO m = new MailDTO();
        m.setToMail(EncryptUtil.decAES128CBC(base.getEmail()));
        m.setTitle("회원 탈퇴 확인 링크");
        m.setContents("""
            아래 링크를 15분 이내 클릭하면 탈퇴가 완료됩니다.<br>
            <a href="%s">탈퇴 진행하기</a><br><br>
            요청하지 않았다면 무시하세요.
            """.formatted(link));
        mailService.doSendMail(m);
        return 1;
    }


    @Override
    public int executeWithdrawByToken(WithdrawTokenDTO pDTO) throws Exception {
        String tokenPlain = CmmUtil.nvl(pDTO.getTokenPlain());
        if (tokenPlain.isEmpty()) return 3;

        Long userInfoId = WithdrawTokenUtil.verifyAndGetUserInfoId(tokenPlain, withdrawSecret);
        if (userInfoId == null) return 3;

        String tokenHash = EncryptUtil.encHashSHA256(tokenPlain);
        WithdrawTokenDTO q = new WithdrawTokenDTO();
        q.setTokenHash(tokenHash);
        WithdrawTokenDTO db = withdrawTokenMapper.getTokenByHash(q);
        if (db == null || !"PENDING".equals(CmmUtil.nvl(db.getStatus()))
                || !userInfoId.equals(db.getUserInfoId())) return 3;

        // 만료 체크
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime exp = LocalDateTime.parse(db.getExpiresAt(), TOKEN_FMT);
        if (now.isAfter(exp)) {
            WithdrawTokenDTO inv = new WithdrawTokenDTO();
            inv.setUserInfoId(userInfoId);
            inv.setChgId("SYSTEM");
            withdrawTokenMapper.invalidateOldTokens(inv);
            return 3;
        }

        // 사용자 조회
        UserInfoDTO uq = new UserInfoDTO();
        uq.setUserInfoId(userInfoId);
        UserInfoDTO user = Optional.ofNullable(userInfoMapper.getUserByUserInfoId(uq)).orElse(new UserInfoDTO());
        String userId = CmmUtil.nvl(user.getUserId());
        if (userId.isEmpty()) return 3;

        // 이미 탈퇴?
        UserInfoDTO chk = new UserInfoDTO();
        chk.setUserId(userId);
        if (userInfoMapper.isAlreadyWithdrawn(chk) == 1) return 2;

        // USER_ID 마스킹 변경
        String ts = DateUtil.getDateTime("yyyyMMddHHmmss");
        int rand = new SecureRandom().nextInt(9000) + 1000;
        String newUserId = "withdraw-" + ts + "-" + rand + "-" + userId;

        UserInfoDTO w = new UserInfoDTO();
        w.setUserId(userId);
        w.setNewUserId(newUserId);

        int updated = userInfoMapper.updateWithdrawUser(w);
        if (updated == 1) {
            WithdrawTokenDTO used = new WithdrawTokenDTO();
            used.setTokenHash(tokenHash);
            used.setChgId(userId);
            withdrawTokenMapper.markTokenUsed(used);
            return 1;
        }
        return 0;
    }

    @Override
    public int updateAddress(UserInfoDTO pDTO) throws Exception {
        if (pDTO == null || CmmUtil.nvl(pDTO.getUserId()).isEmpty()) return 0;
        return userInfoMapper.updateAddress(pDTO);
    }

    @Override
    public UserInfoDTO getUserDetail(UserInfoDTO pDTO) throws Exception {
        log.info("{}.getUserDetail Start!", this.getClass().getName());

        UserInfoDTO rDTO = userInfoMapper.getUserDetail(pDTO);
        rDTO.setEmail(EncryptUtil.decAES128CBC(rDTO.getEmail()));
        log.info("userId={}, userName={}, email={}, addr1={}, addr2={}",
                CmmUtil.nvl(rDTO.getUserId()),
                CmmUtil.nvl(rDTO.getUserName()),
                CmmUtil.nvl(rDTO.getEmail()),
                CmmUtil.nvl(rDTO.getAddr1()),
                CmmUtil.nvl(rDTO.getAddr2()));

        log.info("{}.getUserDetail End!", this.getClass().getName());
        return rDTO;
    }


    @Override
    public int confirmPassword(UserInfoDTO pDTO) throws Exception {
        log.info("{}.confirmPassword Start!", this.getClass().getName());

        if (pDTO == null) {
            log.info("{}.confirmPassword End!", this.getClass().getName());

            return 0;
        }
        String userId = CmmUtil.nvl(pDTO.getUserId());
        String password = CmmUtil.nvl(pDTO.getPassword()); // 이미 해시된 값이어야 함
        if (userId.isEmpty() || password.isEmpty()) {
            log.info("{}.confirmPassword End!", this.getClass().getName());

            return 0;
        }

        UserInfoDTO q = new UserInfoDTO();
        q.setUserId(userId);
        q.setPassword(password);

        int cnt = userInfoMapper.checkPassword(q);
        log.info("{}.confirmPassword End!", this.getClass().getName());

        return cnt == 1 ? 1 : 5; // 1=일치, 5=불일치
    }

}
