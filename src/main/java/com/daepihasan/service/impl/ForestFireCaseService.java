package com.daepihasan.service.impl;

import com.daepihasan.dto.ForestFireCaseDTO;
import com.daepihasan.dto.ForestFireCaseDashboardDTO;
import com.daepihasan.dto.ForestFireCaseStatDTO;
import com.daepihasan.dto.ForestFireSearchDTO;
import com.daepihasan.mapper.IForestFireCaseMapper;
import com.daepihasan.mapper.IRegionMapper;
import com.daepihasan.service.IForestFireCaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ForestFireCaseService implements IForestFireCaseService {

    private final IRegionMapper regionMapper;
    private final IForestFireCaseMapper forestFireCaseMapper;


    /* ===== 상세 조회 ===== */
    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseDTO> getCases(ForestFireSearchDTO pDTO) {
        log.info("{}.getCases Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseDTO> rDTO = forestFireCaseMapper.selectCases(pDTO);


        log.info("{}.getCases End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public long countCases(ForestFireSearchDTO pDTO) {
        log.info("{}.countCases Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        long cnt = forestFireCaseMapper.countCases(pDTO);

        log.info("{}.countCases End!", this.getClass().getName());

        return cnt;
    }

    @Override
    public ForestFireCaseStatDTO totals(ForestFireSearchDTO pDTO) {
        log.info("{}.totals Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        ForestFireCaseStatDTO rDTO = forestFireCaseMapper.totals(pDTO);

        log.info("{}.totals End!", this.getClass().getName());

        return rDTO;
    }

    /* ===== 통계 ===== */
    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> yearlyCounts(ForestFireSearchDTO pDTO) {
        log.info("{}.yearlyCounts Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.yearlyCounts(pDTO);

        log.info("{}.yearlyCounts End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public ForestFireCaseStatDTO yearlyAverage(ForestFireSearchDTO pDTO) {
        log.info("{}.yearlyAverage Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        ForestFireCaseStatDTO rDTO = forestFireCaseMapper.yearlyAverage(pDTO);

        log.info("{}.yearlyAverage End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> causeCounts(ForestFireSearchDTO pDTO) {
        log.info("{}.causeCounts Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.causeCounts(pDTO);

        log.info("{}.causeCounts End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> provinceCounts(ForestFireSearchDTO pDTO) {
        log.info("{}.provinceCounts Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.provinceCounts(pDTO);

        log.info("{}.provinceCounts End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> provinceCountsAll() {
        log.info("{}.provinceCountsAll Start!", this.getClass().getName());
        ForestFireSearchDTO pDTO = new ForestFireSearchDTO();

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.provinceCountsAll();
        for(ForestFireCaseStatDTO dto : rDTO) {
            log.info("ForestFireCaseStatDTO: {}", dto);
        }

        log.info("{}.provinceCountsAll End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> yearlyDamageStats(ForestFireSearchDTO pDTO) {
        log.info("{}.yearlyDamageStats Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.yearlyDamageStats(pDTO);

        log.info("{}.yearlyDamageStats End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> seasonalCounts(ForestFireSearchDTO pDTO) {
        log.info("{}.seasonalCounts Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.seasonalCounts(pDTO);

        log.info("{}.seasonalCounts End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForestFireCaseStatDTO> monthlyCounts(ForestFireSearchDTO pDTO) {
        log.info("{}.monthlyCounts Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.monthlyCounts(pDTO);

        log.info("{}.monthlyCounts End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    public List<ForestFireCaseStatDTO> last12MonthsStats(ForestFireSearchDTO pDTO) {
        log.info("{}.last12MonthsStats Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        List<ForestFireCaseStatDTO> rDTO = forestFireCaseMapper.last12MonthsStats(pDTO);

        log.info("{}.last12MonthsStats End!", this.getClass().getName());
        return rDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public ForestFireCaseDashboardDTO dashboard(ForestFireSearchDTO pDTO) {
        log.info("{}.dashboard Start!", this.getClass().getName());
        log.info("ForestFireSearchDTO : {}", pDTO);

        ForestFireCaseDashboardDTO dto = ForestFireCaseDashboardDTO.builder()
                .totals(totals(pDTO))
                .yearly(yearlyCounts(pDTO))
                .yearlyAvg(yearlyAverage(pDTO))
                .last12Months(last12MonthsStats(pDTO))
                .byCause(causeCounts(pDTO))
//                .byProvince(provinceCounts(pDTO))
                .byProvince(provinceCountsAll())
                .seasonal(seasonalCounts(pDTO))
                .monthly(monthlyCounts(pDTO))
                .build();

        log.info("{}.dashboard End!", this.getClass().getName());
        return dto;
    }
}
