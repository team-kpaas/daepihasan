package com.daepihasan.dto;

import lombok.Data;

@Data
public class FireFacilityItemDTO {
    private Long id;
    private String name;
    private String facilityTypeCd;
    private Double lat;
    private Double lon;
}
