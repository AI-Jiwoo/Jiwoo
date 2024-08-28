package org.jiwoo.back.accelerating.aggregate.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jiwoo.back.accelerating.dto.MarketResearchHistoryDTO;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseMarketResearchHistoryVO {
    private String message;
    private List<MarketResearchHistoryDTO> data;
}
