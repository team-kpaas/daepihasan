package com.daepihasan.service;

import com.daepihasan.dto.MailDTO;

public interface IMailService {
    // 메일 발송
    int doSendMail(MailDTO pDTO);
}
