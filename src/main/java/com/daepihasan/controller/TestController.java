package com.daepihasan.controller;

import com.daepihasan.dto.SpamDTO;
import com.daepihasan.service.ITestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class TestController {

    private final ITestService testService;

    @GetMapping(value = "/test/analyze")
    public SpamDTO analyze() {

        SpamDTO dto = new SpamDTO();
//        dto.setText("완전 감동이에요 다시 봐도 좋네요"); // 긍정부정(label: pos)
        dto.setText("무료쿠폰 지금 수령하세요 => http://ex.am.pl"); // 스팸(label: spam)

        return testService.test(dto);
    }
}
