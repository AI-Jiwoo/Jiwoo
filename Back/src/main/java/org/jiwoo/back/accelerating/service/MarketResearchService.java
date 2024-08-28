package org.jiwoo.back.accelerating.service;

import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.accelerating.dto.MarketResearchHistoryDTO;
import org.jiwoo.back.accelerating.dto.MarketSizeGrowthDTO;
import org.jiwoo.back.accelerating.dto.SimilarServicesAnalysisDTO;
import org.jiwoo.back.accelerating.dto.TrendCustomerTechnologyDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MarketResearchService {
    MarketSizeGrowthDTO getMarketSizeAndGrowth(BusinessDTO businessDTO);
    SimilarServicesAnalysisDTO analyzeSimilarServices(BusinessDTO businessDTO);
    TrendCustomerTechnologyDTO getTrendCustomerTechnology(BusinessDTO businessDTO);
    void saveMarketResearchHistory(MarketResearchHistoryDTO historyDTO);
    List<MarketResearchHistoryDTO> findAllMarketResearchByUser(String userEmail, Pageable pageable);
}