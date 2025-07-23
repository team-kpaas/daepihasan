package com.daepihasan.controller;

import com.daepihasan.dto.MailDTO;
import com.daepihasan.dto.MsgDTO;
import com.daepihasan.service.IMailService;
import com.daepihasan.util.CmmUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Slf4j
@RequestMapping(value = "/mail")
@RequiredArgsConstructor
@Controller
public class MailController {

    private final IMailService mailService; // 메일 발송을 위한 서비스 객체를 사용하기

    /**
     * 메일 발송하기 폼
     */
    @GetMapping(value = "mailForm")
    public String mailForm() {

        log.info("{}.mailForm start!", this.getClass().getName());

        return "mail/mailForm";
    }

    @ResponseBody
    @PostMapping(value = "sendMail")
    public MsgDTO sendMail(HttpServletRequest request) {

        log.info("{}.sendMail start!", this.getClass().getName());

        String msg; // 발송 결과 메시지

        String toMail = CmmUtil.nvl(request.getParameter("toMail")); // 받는사람
        String title = CmmUtil.nvl(request.getParameter("title")); // 제목
        String contents = CmmUtil.nvl(request.getParameter("contents")); // 내용

        log.info("toMail : {} / title : {} / contents : {}  ",
                toMail, title, contents);

        MailDTO pDTO = new MailDTO();

        pDTO.setToMail(toMail); // 받는 사람을 DTO에 저장
        pDTO.setTitle(title); // 제목을 DTO에 저장
        pDTO.setContents(contents); // 내용을 DTO에 저장

        // 메일 발송하기
        int res = mailService.doSendMail(pDTO);

        if (res == 1) { // 메일발송 성공
            msg = "메일 발송하였습니다.";
        } else { // 메일발송 실패
            msg = "메일 발송 실패하였습니다.";
        }

        log.info(msg);

        // 결과 메시지 전달하기
        MsgDTO dto = new MsgDTO();
        dto.setMsg(msg);

        log.info("{}.mailForm start!", this.getClass().getName());

        return dto;
    }
}
