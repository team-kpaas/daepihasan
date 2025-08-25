package com.daepihasan.service.impl;

import com.daepihasan.dto.*;
import com.daepihasan.mapper.ICodeMapper;
import com.daepihasan.mapper.IFireForestMapper;
import com.daepihasan.service.IFireForestService;
import com.daepihasan.util.CmmUtil;
import com.daepihasan.util.NetworkUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;

@Slf4j
@RequiredArgsConstructor
@Service
public class FireForestService implements IFireForestService {

    private final IFireForestMapper fireForestMapper;
    private final ICodeMapper codeMapper;

    @Value("${data.api.decodeKey}")
    private String apiKey;

    private static final String API_URL =
            "http://apis.data.go.kr/1661000/FireInformationService/getOcBywdldFpcnd";
    private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    @Transactional
    public void ingest() {
        log.info("{}.ingest Start!", this.getClass().getName());

        // 구간 결정: 비어있으면 2015-01-01부터, 있으면 MAX+1일부터 어제까지
        LocalDate maxYmd = fireForestMapper.getMaxOcrnYmd();
        log.info("maxYmd: {}", maxYmd);

        LocalDate start  = (maxYmd == null) ? LocalDate.of(2015, 1, 1) : maxYmd.plusDays(1);
        LocalDate end    = LocalDate.now().minusDays(1);

        log.info("start: {}, end: {}", maxYmd, start, end);

        if (start.isAfter(end)) {
            log.info("신규 수집 대상 없음: start={}, end={}", start, end);
            return;
        }

        ObjectMapper mapper = new ObjectMapper();

        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            String ocrnYmdStr = d.format(YMD);

            String url = API_URL
                    + "?serviceKey=" + URLEncoder.encode(apiKey, UTF_8)
                    + "&pageNo=1&numOfRows=10000&resultType=json"
                    + "&ocrn_ymd=" + ocrnYmdStr;

            String json = NetworkUtil.get(url);

            try {
                Map<String, Object> root = mapper.readValue(json, LinkedHashMap.class);

                // body가 최상위인 포멧으로 api 제공
                Map<String, Object> body = (Map<String, Object>) root.get("body");
                List<Map<String, Object>> itemList  = (List<Map<String, Object>>) body.get("items");

                log.info("[{}] 수집 {}건", ocrnYmdStr, itemList.size());

                for (Map<String, Object> it : itemList) {
                    // 소분류명: null/공백 기본값 처리 + 정규화
                    String rawNm   = String.valueOf(it.get("WDLD_SCLSF_NM"));
                    String safeNm  = CmmUtil.nvl(rawNm, "기타 임야"); // 소분류 값이 존재하지 않는 경우 기타 임야로 지정
                    String sclsfNm = normalizeName(safeNm); // 정규화

                    // 코드 조회/생성
                    CodeDTO codeDTO = getOrCreateSclsfCode(sclsfNm);
                    String sclsfCd = codeDTO.getCodeCd();

                    // 숫자값 파싱 (Number/String 모두 허용)
                    long ocrnMnb = CmmUtil.nvl(String.valueOf(it.get("OCRN_MNB")), 0L);
                    long life    = CmmUtil.nvl(String.valueOf(it.get("LIFE_DMG_PERCNT")), 0L);
                    long vctm    = CmmUtil.nvl(String.valueOf(it.get("VCTM_PERCNT")), 0L);
                    long inj     = CmmUtil.nvl(String.valueOf(it.get("INJRDPR_PERCNT")), 0L);
                    long prpt    = CmmUtil.nvl(String.valueOf(it.get("PRPT_DMG_SBTT_AMT")), 0L);

                    // 날짜: 하이픈/슬래시 제거 후 yyyyMMdd 보정
                    String ymd = CmmUtil.nvl(String.valueOf(it.get("OCRN_YMD")), ocrnYmdStr);
                    LocalDate ocrnYmd = LocalDate.parse(ymd, YMD);

                    LocalDate searchDt  = LocalDate.now();
                    LocalDateTime nowTs = LocalDateTime.now();

                    FireForestStatDTO dto = FireForestStatDTO.builder()
                            .wdldSclsfCd(sclsfCd)
                            .wdldSclsfNm(sclsfNm)
                            .ocrnYmd(ocrnYmd)
                            .ocrnMnb(ocrnMnb)
                            .lifeDmgPercnt(life)
                            .vctmPercnt(vctm)
                            .injrdprPercnt(inj)
                            .prptDmgSbttAmt(prpt)
                            .searchDate(searchDt)
                            .regId("SYSTEM")
                            .regDt(nowTs)
                            .chgId("SYSTEM")
                            .chgDt(nowTs)
                            .build();

                    log.info("FireForestStatDTO.getWdldSclsfCd: {}", dto.getWdldSclsfCd());
                    log.info("FireForestStatDTO.getWdldSclsfNm: {}", dto.getWdldSclsfNm());
                    log.info("FireForestStatDTO.getOcrnYmd: {}", dto.getOcrnYmd());
                    log.info("FireForestStatDTO.getOcrnMnb: {}", dto.getOcrnMnb());
                    log.info("FireForestStatDTO.getLifeDmgPercnt: {}", dto.getLifeDmgPercnt());
                    log.info("FireForestStatDTO.getVctmPercnt: {}", dto.getVctmPercnt());
                    log.info("FireForestStatDTO.getInjrdprPercnt: {}", dto.getInjrdprPercnt());
                    log.info("FireForestStatDTO.getPrptDmgSbttAmt: {}", dto.getPrptDmgSbttAmt());
                    log.info("FireForestStatDTO.getSearchDate: {}", dto.getSearchDate());

                    fireForestMapper.upsertFireForestStat(dto);
                }

            } catch (Exception e) {
                log.error("[{}] 처리 실패 - 롤백", ocrnYmdStr, e);
                throw new RuntimeException(e);
            }
        }

        log.info("{}.ingest End!", this.getClass().getName());
    }

    @Override
    @Transactional(readOnly = true) // 조회만 수행
    public FireForestKpiDTO getKpiYoY(FireForestRangeDTO range) {
        log.info("{}.getKpiYoY Start!,", this.getClass().getName());

        FireForestKpiDTO dto = fireForestMapper.getKpiYoY(range);

        if (dto == null) {
            // 결과가 없을 때 UI 일관성을 위해 0L/NULL 채우기 수행
            dto = FireForestKpiDTO.builder()
                    .cntPrev(0L).cntCur(0L).cntDiff(0L).cntDiffPct(null)
                    .propPrev(0L).propCur(0L).propDiff(0L).propDiffPct(null)
                    .deathPrev(0L).deathCur(0L).deathDiff(0L).deathDiffPct(null)
                    .injuryPrev(0L).injuryCur(0L).injuryDiff(0L).injuryDiffPct(null)
                    .build();
        }
        log.info(dto.toString());

        log.info("{}.getKpiYoY End!,", this.getClass().getName());

        return dto;
    }

    @Transactional(readOnly = true)
    @Override
    public List<FireForestCauseDTO> getCausesAgg(FireForestRangeDTO range) {
        log.info("{}.getCausesAgg Start!", this.getClass().getName());

        List<FireForestCauseDTO> rDTO = fireForestMapper.getCausesAgg(range);

        log.info("{}.getCausesAgg End!", this.getClass().getName());
        return rDTO;
    }

    /** 이름 정규화: ',-,·' → '.' + 공백 정리 */
    private String normalizeName(String s) {
        s = CmmUtil.nvl(s, "기타 들불");
        s = s.replace('\u00A0', ' ').trim();
        s = s.replace('·', '.').replace('∙', '.').replace('・', '.').replace('ㆍ', '.');
        s = s.replace(',', '.').replace('-', '.');
        s = s.replaceAll("\\s+", " ");
        if (s.isEmpty()) s = "기타 들불";
        return s;
    }

    /** 임야(001) 하위 소분류 코드 조회/생성 */
    private CodeDTO getOrCreateSclsfCode(String sclsfNm) {
        log.info("{}.getOrCreateSclsfCode Start!", this.getClass().getName());

        // 1) 조회
        CodeDTO q = CodeDTO.builder().codeNm(sclsfNm).build();
        CodeDTO cur = codeMapper.getForestSclsfCodeNm(q);

        if (cur != null && cur.getCodeCd() != null) {
            log.info("Found existing code: {}", cur);
            return cur;
        }

        // 2) 없으면 신규 코드 생성
        String nextCd = codeMapper.selectNextSclsfCode();

        CodeDTO ins = CodeDTO.builder()
                .codeCd(nextCd)
                .codeNm(sclsfNm)
                .codeStat("Y")
//                .regId("SYSTEM")
//                .chgId("SYSTEM")
                .build();

        codeMapper.insertSclsfCode(ins);
        log.info("Inserted new code: {}", ins);

        log.info("{}.getOrCreateSclsfCode End!", this.getClass().getName());

        return ins;  // DTO 자체 반환
    }
}
