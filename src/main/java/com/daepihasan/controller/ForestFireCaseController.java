package com.daepihasan.controller;

import com.daepihasan.dto.ForestFireCaseDashboardDTO;
import com.daepihasan.dto.ForestFireSearchDTO;
import com.daepihasan.dto.MsgDTO;
import com.daepihasan.service.IForestFireCaseService;
import com.daepihasan.util.CmmUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RequestMapping(value = "/forestFireCase")
@RequiredArgsConstructor
@RestController
public class ForestFireCaseController {

    // 의존성 주입
    private final IForestFireCaseService forestFireCaseService;

    /**
     * 산불 통계 대시보드 (전국/시도 단위)
     * - regionCd = "00" 또는 누락/공백 -> 전국(00)은 공백으로 처리하여 전체 통계를 처리하도록
     * - regionCd = "11","31"... -> 해당 시도만 필터
     */
    @GetMapping("/dashboard")
    public MsgDTO dashboard(HttpServletRequest request) {
        log.info("{}.getForestFireCaseRegister Start!", this.getClass().getName());

        String regionCd = CmmUtil.nvl(request.getParameter("regionCd"));
        log.info("raw regionCd : {}", regionCd);

        MsgDTO dto = new MsgDTO();
        int res = 0; // 올바르지 않은 경우: 0, 올바른 경우: 1, 비정상 접근: 2
        String msg; // 메시지

        try {
            // 전국 처리
            String provinceCd = (regionCd == null || regionCd.isBlank() || regionCd.equals("00")) ? null : regionCd;
            log.info("normalized provinceCd: {}", provinceCd == null ? "ALL" : provinceCd);

            // Search 조건 구성
            ForestFireSearchDTO cond = ForestFireSearchDTO.builder()
                    .provinceCd(provinceCd)
                    .build();

            // 서비스 호출 (한 번에 묶은 대시보드)
            ForestFireCaseDashboardDTO data = forestFireCaseService.dashboard(cond);

            // 응답
            res = 1;
            msg = "정상적으로 조회되었습니다.";

            dto.setResult(res);
            dto.setMsg(msg);
            dto.setData(data);

        } catch (Exception e) {
            log.warn("dashboard error", e);

            res = 2;
            msg = "서버 오류가 발생했습니다.";

            dto.setResult(res);
            dto.setMsg(msg);
            return dto;

        } finally {
            log.info("{}.getForestFireCaseRegister End!", this.getClass().getName());
        }

        return dto;
    }
}