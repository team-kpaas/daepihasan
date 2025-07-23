package com.daepihasan.service.impl;

import com.daepihasan.dto.MailDTO;
import com.daepihasan.service.IMailService;
import com.daepihasan.util.CmmUtil;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class MailService implements IMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromMail;

    @Override
    public int doSendMail(MailDTO pDTO) {

        log.info("{}.doSendMail start!", this.getClass().getName());

        // 메일 발송 성공여부(발송성공 : 1 / 발송실패 : 0)
        int res = 1;

        if (pDTO == null) {
            pDTO = new MailDTO();
        }

        String toMail = CmmUtil.nvl(pDTO.getToMail()); // 받는사람
        String title = CmmUtil.nvl(pDTO.getTitle()); // 메일제목

        String contents = """
        <div style="font-family: 'Malgun Gothic', sans-serif; padding: 20px;">
            <h2 style="color: #2c3e50;">📢 안녕하세요!</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
                %s
            </div>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
            <p style="color: #555;">감사합니다.<br>대피하산 팀</p>
        </div>
        """.formatted(CmmUtil.nvl(pDTO.getContents()));

        log.info("toMail : {} / title : {} / contents : {}", toMail, title, contents);

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper messageHelper = new MimeMessageHelper(message, "UTF-8");

        try {
            messageHelper.setTo(toMail); // 받는 사람
            messageHelper.setFrom(fromMail); // 보내는 사람
            messageHelper.setSubject(title); // 메일 제목
            messageHelper.setText(contents, true); // HTML 형식으로 발송

            mailSender.send(message);
        } catch (Exception e) { // 모든 에러 다 잡기
            res = 0; // 메일 발송이 실패했기 때문에 0으로 변경
            log.info("[ERROR] doSendMail : {}", e);
        }

        log.info("{}.doSendMail End!", this.getClass().getName());

        return res;
    }
}
