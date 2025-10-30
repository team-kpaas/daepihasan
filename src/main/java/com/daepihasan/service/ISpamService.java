package com.daepihasan.service;

import com.daepihasan.dto.SpamDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "sentimentClient",
        url = "${sentiment.base-url}"
)
public interface ISpamService {

    @PostMapping(value = "/predict",
            consumes = "application/json",
            produces = "application/json")
    SpamDTO predict(@RequestBody SpamDTO pDTO);
}