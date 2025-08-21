package com.daepihasan.scheduler;

import com.daepihasan.service.IFireForestStatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FireForestIngestScheduler {

    private final IFireForestStatService fireForestStatService;

    // 매일 새벽 03:00에 실행
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    public void runDailyIngest() {
        log.info("{}.runDailyIngest Start!", this.getClass().getName());
        try {
            fireForestStatService.ingest(); // 배치 진입점 호출
        } catch (Exception e) {
            log.error("[Scheduler] FireForest ingest failed", e);
        }
        log.info("{}.runDailyIngest End!", this.getClass().getName());
    }

    // 개발 중 빠르게 확인하고 싶으면 주석 해제해서 사용
    // @Scheduled(initialDelayString = "PT10S", fixedDelayString = "PT1H")
    // public void debugRun() { fireForestStatService.ingest(); }
}
