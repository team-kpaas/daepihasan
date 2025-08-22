package com.daepihasan.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/view")
public class TMapController {
    @Value("${tmap.api.key}")
    private String tmapApiKey;

    @GetMapping("/map")
    public String map(Model model) {
        model.addAttribute("tmapApiKey", tmapApiKey);
        return "common/tmap";
    }
}
