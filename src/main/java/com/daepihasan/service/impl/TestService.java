package com.daepihasan.service.impl;

import com.daepihasan.dto.SpamDTO;
import com.daepihasan.service.ISpamService;
import com.daepihasan.service.ITestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class TestService implements ITestService {

    private final ISpamService spamService;

    @Override
    public SpamDTO test(SpamDTO pDTO) {
        return spamService.predict(pDTO);
    }
}
