package com.daepihasan.controller;

import com.daepihasan.service.IUserInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@RequiredArgsConstructor
@Controller
public class MainController {
    private final IUserInfoService userInfoService;

    /**
     * 메인 화면으로 이동
     */
    @GetMapping(value = "/")
    public String indexPage() {
        log.info("{}.indexPage Start!", this.getClass().getName());

        log.info("{}.indexPage End!", this.getClass().getName());
        return "index";
    }



}