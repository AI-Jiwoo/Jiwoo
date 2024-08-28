package org.jiwoo.back.accelerating.aggregate.vo;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.jiwoo.back.accelerating.dto.MarketSizeGrowthDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseMarketResearchVO {
    private String message;
    private MarketSizeGrowthDTO data;
}