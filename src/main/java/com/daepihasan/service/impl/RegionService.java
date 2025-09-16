package com.daepihasan.service.impl;

import com.daepihasan.dto.RegionDTO;
import com.daepihasan.mapper.IRegionMapper;
import com.daepihasan.service.IRegionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class RegionService implements IRegionService {

    private final IRegionMapper regionMapper;

    @Override
    public List<RegionDTO> getRegions() {
        log.info("{}.getRegions Start!", this.getClass().getName());

        List<RegionDTO> rDTO = regionMapper.getRegions();

        log.info("{}.getRegions End!", this.getClass().getName());

        return rDTO;
    }

    @Override
    public List<RegionDTO> getChildrenRegion(String pRegionCD) {
        log.info("{}.getChildrenRegion Start!", this.getClass().getName());
        log.info("pRegionCD : {}", pRegionCD);

        List<RegionDTO> rDTO = regionMapper.getChildrenRegion(pRegionCD);

        log.info("{}.getChildrenRegion End!", this.getClass().getName());

        return rDTO;
    }
}
