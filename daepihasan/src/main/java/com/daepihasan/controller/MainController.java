package com.daepihasan.controller;

import com.daepihasan.service.IUserInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@RequiredArgsConstructor
@Controller
public class MainController {
    private final IUserInfoService userInfoService;
    @Value("${tmap.api.key}")
    private String tmapApiKey;
    /**
     * 메인 화면으로 이동
     */


    @GetMapping(value = "/")
    public String indexPage(Model model) {
        log.info("{}.indexPage Start!", this.getClass().getName());
        model.addAttribute("tmapApiKey", tmapApiKey);//api키넘기기
        log.info("{}.indexPage End!", this.getClass().getName());
        return "index";
    }



}