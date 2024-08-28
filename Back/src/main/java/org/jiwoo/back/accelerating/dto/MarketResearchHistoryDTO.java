package org.jiwoo.back.accelerating.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarketResearchHistoryDTO {
    private LocalDateTime createAt;
    private String marketInformation;
    private String competitorAnalysis;
    private String marketTrends;
    private String regulationInformation;
    private String marketEntryStrategy;
    private int businessId;
}
