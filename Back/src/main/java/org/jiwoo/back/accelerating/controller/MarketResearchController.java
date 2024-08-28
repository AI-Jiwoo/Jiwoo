package org.jiwoo.back.accelerating.controller;

import jakarta.persistence.EntityNotFoundException;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseMarketResearchHistoryVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseSimilarVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseTrendCustomerTechnologyVO;
import org.jiwoo.back.accelerating.dto.MarketResearchHistoryDTO;
import org.jiwoo.back.accelerating.service.MarketResearchService;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseMarketResearchVO;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

@RestController
@RequestMapping("/market-research")
public class MarketResearchController {

    private final MarketResearchService marketResearchService;

    public MarketResearchController(MarketResearchService marketResearchService) {
        this.marketResearchService = marketResearchService;
    }

    /* 설명. 사업 정보 기반 시장규모, 성장률 조회 */
    @PostMapping("/market-size-growth")
    public ResponseEntity<?> getMarketSizeAndGrowth(@RequestBody BusinessDTO businessDTO) {
        return executeMarketResearch(businessDTO, marketResearchService::getMarketSizeAndGrowth, ResponseMarketResearchVO::new);
    }

    /* 설명. 유사 서비스 분석 조회 */
    @PostMapping("/similar-services-analysis")
    public ResponseEntity<?> getSimilarServicesAnalysis(@RequestBody BusinessDTO businessDTO) {
        return executeMarketResearch(businessDTO, marketResearchService::analyzeSimilarServices, ResponseSimilarVO::new);
    }

    /* 설명. 사업 정보 기반 트렌드, 연령층별 고객분포, 기술 동향 조회 */
    @PostMapping("/trend-customer-technology")
    public ResponseEntity<?> getTrendCustomerTechnology(@RequestBody BusinessDTO businessDTO) {
        return executeMarketResearch(businessDTO, marketResearchService::getTrendCustomerTechnology, ResponseTrendCustomerTechnologyVO::new);
    }

    /* 설명. 요청 응답 처리 메소드 */
    private <T, R> ResponseEntity<?> executeMarketResearch(BusinessDTO businessDTO,
                                                           Function<BusinessDTO, T> serviceMethod,
                                                           BiFunction<String, T, R> responseConstructor) {
        try {
            T result = serviceMethod.apply(businessDTO);
            R response = responseConstructor.apply("조회 성공", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            R errorResponse = responseConstructor.apply("조회 실패: " + e.getMessage(), null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /* 설명. 시장 조회 이력 저장 */
    @PostMapping("/save-history")
    public ResponseEntity<String> saveMarketResearchHistory(@RequestBody MarketResearchHistoryDTO historyDTO) {
        try {
            marketResearchService.saveMarketResearchHistory(historyDTO);
            return ResponseEntity.ok("조회 이력 저장 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("조회 이력 저장 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("조회 이력 저장 실패: 내부 서버 오류");
        }
    }

    /* 설명. 시장 조회 이력 조회 */
    @GetMapping("/history")
    public ResponseEntity<ResponseMarketResearchHistoryVO> getMarketResearchHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            String userEmail = userDetails.getUsername();
            List<MarketResearchHistoryDTO> histories = marketResearchService.findAllMarketResearchByUser(userEmail, pageable);
            return ResponseEntity.ok(new ResponseMarketResearchHistoryVO("시장 조회 이력 조회 성공", histories));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseMarketResearchHistoryVO("사용자를 찾을 수 없습니다: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMarketResearchHistoryVO("서버 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }
}