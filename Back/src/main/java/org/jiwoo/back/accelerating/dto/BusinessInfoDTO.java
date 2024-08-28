package org.jiwoo.back.accelerating.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusinessInfoDTO {
    private String businessPlatform;
    private String businessScale;
    @JsonProperty("business_field")
    private String businessField;
    private String businessStartDate;
    private String investmentStatus;
    private String customerType;
}
