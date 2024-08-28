package org.jiwoo.back.accelerating.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarketSizeGrowthDTO {
    private int businessId;
    private String marketSize;
    private String growthRate;
}