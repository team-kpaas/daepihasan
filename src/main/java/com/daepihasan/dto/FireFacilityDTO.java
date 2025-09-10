package com.daepihasan.dto;

import lombok.Data;

@Data
public class FireFacilityDTO {
    private Long id;
    private String facilityNo;
    private String name;
    private String facilityTypeCd;
    private String mngInstNm;
    private String mngInstTel;
    private Integer installYear;
    private Double lat;
    private Double lon;
}