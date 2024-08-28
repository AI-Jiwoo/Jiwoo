package org.jiwoo.back.accelerating.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.jiwoo.back.accelerating.aggregate.entity.MarketResearch;
import org.jiwoo.back.accelerating.aggregate.vo.ResponsePythonServerVO;
import org.jiwoo.back.accelerating.dto.MarketResearchHistoryDTO;
import org.jiwoo.back.accelerating.dto.TrendCustomerTechnologyDTO;
import org.jiwoo.back.accelerating.repository.MarketResearchRepository;
import org.jiwoo.back.user.aggregate.entity.User;
import org.jiwoo.back.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.category.service.CategoryService;
import org.jiwoo.back.accelerating.dto.MarketSizeGrowthDTO;
import org.jiwoo.back.common.OpenAI.service.OpenAIService;
import org.jiwoo.back.accelerating.dto.SimilarServicesAnalysisDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MarketResearchServiceImpl implements MarketResearchService {

    private final OpenAIService openAIService;
    private final CategoryService categoryService;
    private final RestTemplate restTemplate;
    private final MarketResearchRepository marketResearchRepository;
    private final UserRepository userRepository;

    @Value("${python.server.url.search}")
    private String pythonServerUrl;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public MarketResearchServiceImpl(OpenAIService openAIService, CategoryService categoryService, @Qualifier("defaultTemplate") RestTemplate restTemplate, MarketResearchRepository marketResearchRepository, UserRepository userRepository) {
        this.openAIService = openAIService;
        this.categoryService = categoryService;
        this.restTemplate = restTemplate;
        this.marketResearchRepository = marketResearchRepository;
        this.userRepository = userRepository;
    }

    /* 설명. 시장 규모, 성장률 조회 */
    @Override
    public MarketSizeGrowthDTO getMarketSizeAndGrowth(BusinessDTO businessDTO) {
        try {
            String categoryNames = categoryService.getCategoryNameByBusinessId(businessDTO.getId());
            String prompt = generatePrompt(businessDTO, categoryNames);
            log.info("Generated prompt: {}", prompt);

            String response = openAIService.generateAnswer(prompt);
            log.info("Received response from OpenAI: {}", response);

            return parseResponse(businessDTO.getId(), response);
        } catch (Exception e) {
            log.error("Error in getMarketSizeAndGrowth", e);
            throw new RuntimeException("Failed to get market size and growth data: " + e.getMessage(), e);
        }
    }

    private String generatePrompt(BusinessDTO businessDTO, String categoryNames) {
        return String.format(
                "다음 정보를 바탕으로 %s 분야의 IT 시장 규모와 성장률 정보를 제공해주세요:\n" +
                        "사업 분야: %s\n" +
                        "사업 규모: %s\n" +
                        "국가: %s\n" +
                        "고객유형: %s\n" +
                        "사업유형: %s\n" +
                        "사업내용: %s\n\n" +
                        "응답은 반드시 다음 형식을 따라주시고, 가능한 한 상세히 설명해주세요:\n" +
                        "시장 규모: [금액] (구체적인 수치와 함께 시장 규모에 대한 부연 설명)\n" +
                        "성장률: [비율] (성장률에 대한 추가 정보, 예: 투자 동향, 시장 전망 등)\n\n" +
                        "예시:\n" +
                        "시장 규모: 약 100억원으로 추정됩니다. 이는 작년 대비 15%% 증가한 수치이며, 주요 기업들의 적극적인 투자로 인해 시장이 확대되고 있습니다.\n" +
                        "성장률: 연간 20%% 성장 중이며, 특히 외국인 투자가 크게 증가하고 있습니다. 향후 5년간 이러한 성장세가 지속될 것으로 전망됩니다.\n\n" +
                        "만약 정확한 정보를 제공할 수 없다면, 대략적인 추정치나 관련 산업의 통계를 활용하여 설명해주세요.",
                categoryNames,
                categoryNames,
                businessDTO.getBusinessScale(),
                businessDTO.getNation(),
                businessDTO.getCustomerType(),
                businessDTO.getBusinessPlatform(),
                businessDTO.getBusinessContent()
        );
    }

    private MarketSizeGrowthDTO parseResponse(int businessId, String response) {
        log.info("Parsing response: {}", response);
        String marketSize = "정보 없음";
        String growthRate = "정보 없음";

        int marketSizeStart = response.indexOf("시장 규모:");
        int marketSizeEnd = response.indexOf("성장률:");
        if (marketSizeStart != -1 && marketSizeEnd != -1) {
            marketSize = response.substring(marketSizeStart + 6, marketSizeEnd).trim();
        } else if (marketSizeStart != -1) {
            marketSize = response.substring(marketSizeStart + 6).trim();
        }

        int growthRateStart = response.indexOf("성장률:");
        if (growthRateStart != -1) {
            growthRate = response.substring(growthRateStart + 4).trim();
        }

        return new MarketSizeGrowthDTO(businessId, marketSize, growthRate);
    }

    /* 설명. 유사 서비스 분석 조회 */
    @Override
    public SimilarServicesAnalysisDTO analyzeSimilarServices(BusinessDTO businessDTO) {
        try {
            String categoryNames = categoryService.getCategoryNameByBusinessId(businessDTO.getId());
            List<ResponsePythonServerVO> similarServices = getSimilarServicesFromPythonServer(businessDTO);

            String analysis = analyzeWithOpenAI(businessDTO, similarServices, categoryNames);
            return new SimilarServicesAnalysisDTO(businessDTO.getId(), convertToStringList(similarServices), analysis);
        } catch (Exception e) {
            log.error("Error in analyzeSimilarServices", e);
            throw new RuntimeException("Failed to analyze similar services: " + e.getMessage(), e);
        }
    }

    private List<ResponsePythonServerVO> getSimilarServicesFromPythonServer(BusinessDTO businessDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = createRequestBody(businessDTO);

        log.debug("BusinessDTO: {}", businessDTO);
        log.debug("Request body: {}", requestBody);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<List<ResponsePythonServerVO>> response = restTemplate.exchange(
                    pythonServerUrl,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<List<ResponsePythonServerVO>>() {}
            );
            List<ResponsePythonServerVO> body = response.getBody();
            log.debug("Response from Python server: {}", body);
            return body != null ? body : Collections.emptyList();
        } catch (HttpClientErrorException e) {
            log.error("Error from Python server: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to get similar services from Python server", e);
        }
    }

    private Map<String, Object> createRequestBody(BusinessDTO businessDTO) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("id", businessDTO.getId());
        requestBody.put("businessName", businessDTO.getBusinessName());
        requestBody.put("businessNumber", businessDTO.getBusinessNumber());
        requestBody.put("businessScale", businessDTO.getBusinessScale());
        requestBody.put("businessBudget", businessDTO.getBusinessBudget());
        requestBody.put("businessContent", businessDTO.getBusinessContent());
        requestBody.put("businessPlatform", businessDTO.getBusinessPlatform());
        requestBody.put("businessLocation", businessDTO.getBusinessLocation());
        requestBody.put("businessStartDate", formatDate(businessDTO.getBusinessStartDate()));
        requestBody.put("nation", businessDTO.getNation());
        requestBody.put("investmentStatus", businessDTO.getInvestmentStatus());
        requestBody.put("customerType", businessDTO.getCustomerType());
        requestBody.put("business_field", categoryService.getCategoryNameByBusinessId(businessDTO.getId()));
        return requestBody;
    }

    String formatDate(Date date) {
        if (date == null) return null;
        try {
            return new SimpleDateFormat("yyyy-MM-dd").format(date);
        } catch (Exception e) {
            log.error("Error formatting date: {}", date, e);
            return null;
        }
    }

    private String analyzeWithOpenAI(BusinessDTO businessDTO, List<ResponsePythonServerVO> similarServices, String categoryNames) throws Exception {
        String prompt = createSimilarServicesPrompt(businessDTO, similarServices, categoryNames);
        log.info("Generated prompt: {}", prompt);
        return openAIService.generateAnswer(prompt);
    }

    private String createSimilarServicesPrompt(BusinessDTO businessDTO, List<ResponsePythonServerVO> similarServices, String categoryNames) {
        String similarServicesString = convertToString(similarServices);
        return String.format(
                "유사 서비스를 제공하는 기업들을 분석해주세요(강점, 약점, 특징, 전략):\n" +
                        "유사한 서비스를 제공하는 기업: %s\n\n" +
                        "사업 내용: %s\n" +
                        "사업 분야: %s\n",
                        similarServicesString,
                businessDTO.getBusinessContent(),
                categoryNames
        );
    }

    private String convertToString(List<ResponsePythonServerVO> similarServices) {
        return similarServices.stream()
                .map(service -> String.format("%s (유사도: %.2f)", service.getBusinessName(), service.getSimilarityScore()))
                .collect(Collectors.joining(", "));
    }

    private List<String> convertToStringList(List<ResponsePythonServerVO> similarServices) {
        return similarServices.stream()
                .map(service -> String.format("%s (유사도: %.2f)", service.getBusinessName(), service.getSimilarityScore()))
                .collect(Collectors.toList());
    }

    /* 설명. 사업 정보 기반 트렌드, 연령층별 고객분포, 기술 동향 조회 */
    @Override
    public TrendCustomerTechnologyDTO getTrendCustomerTechnology(BusinessDTO businessDTO) {
        try {
            String categoryNames = categoryService.getCategoryNameByBusinessId(businessDTO.getId());
            String prompt = generateTrendCustomerTechnologyPrompt(businessDTO, categoryNames);
            log.info("Generated prompt for trend, customer, technology: {}", prompt);

            String response = openAIService.generateAnswer(prompt);
            log.info("Received response from OpenAI for trend, customer, technology: {}", response);

            return parseTrendCustomerTechnologyResponse(businessDTO.getId(), response);
        } catch (Exception e) {
            log.error("Error in getTrendCustomerTechnology", e);
            throw new RuntimeException("Failed to get trend, customer distribution, and technology trend data: " + e.getMessage(), e);
        }
    }

    private String generateTrendCustomerTechnologyPrompt(BusinessDTO businessDTO, String categoryNames) {
        return String.format(
                "다음 정보를 바탕으로 %s 분야의 트렌드, 주요 고객, 기술 동향 정보를 제공해주세요:\n" +
                        "사업 분야: %s\n" +
                        "사업 규모: %s\n" +
                        "국가: %s\n" +
                        "고객유형: %s\n" +
                        "사업유형: %s\n" +
                        "사업내용: %s\n\n" +
                        "응답은 반드시 다음 형식을 따라주시고, 가능한 한 상세히 설명해주세요:\n" +
                        "트렌드: (현재 시장 트렌드에 대한 상세 설명)\n" +
                        "주요 고객: (현재 시장에 관심이 많은 고객층 설명, 연령대, 특성 등 포함)\n" +
                        "기술 동향: (관련 기술 동향에 대한 상세 설명)\n\n" +
                        "주요 고객 예시로 20대초반, 30대 중반이 관심이 많고 주 수요 고객입니다. 의 형식을 지켜주세요." +
                        "주요 고객에서 삼가야할 예시로 20대초반부터 30대 중반까지의 형태가 있습니다. 범위적인 표현을 삼가주세요." +
                        "만약 정확한 정보를 제공할 수 없다면, 대략적인 추정치나 관련 산업의 통계를 활용하여 설명해주세요.",
                categoryNames,
                categoryNames,
                businessDTO.getBusinessScale(),
                businessDTO.getNation(),
                businessDTO.getCustomerType(),
                businessDTO.getBusinessPlatform(),
                businessDTO.getBusinessContent()
        );
    }

    private TrendCustomerTechnologyDTO parseTrendCustomerTechnologyResponse(int businessId, String response) {
        log.info("Parsing response for trend, customer, technology: {}", response);
        String trend = "정보 없음";
        String mainCustomers = "정보 없음";
        String technologyTrend = "정보 없음";

        String[] parts = response.split("\n");
        for (String part : parts) {
            if (part.startsWith("트렌드:")) {
                trend = part.substring("트렌드:".length()).trim();
            } else if (part.startsWith("주요 고객:")) {
                mainCustomers = part.substring("주요 고객:".length()).trim();
            } else if (part.startsWith("기술 동향:")) {
                technologyTrend = part.substring("기술 동향:".length()).trim();
            }
        }

        return new TrendCustomerTechnologyDTO(businessId, trend, mainCustomers, technologyTrend);
    }

    /* 설명. 시장 조회 이력 저장 */
    @Override
    @Transactional
    public void saveMarketResearchHistory(MarketResearchHistoryDTO historyDTO) {
        if (historyDTO.getBusinessId() <= 0) {
            throw new IllegalArgumentException("Invalid Business ID: " + historyDTO.getBusinessId());
        }

        // BUSINESS_ID가 tbl_business 테이블에 존재하는지 확인
        String checkSql = "SELECT COUNT(*) FROM tbl_business WHERE ID = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, historyDTO.getBusinessId());
        if (count == 0) {
            throw new IllegalArgumentException("Business with ID " + historyDTO.getBusinessId() + " does not exist");
        }

        String sql = "INSERT INTO tbl_market_research (CREATED_AT, MARKET_INFORMATION, COMPETITOR_ANALYSIS, MARKET_TRENDS, REGULATION_INFORMATION, MARKET_ENTITY_STRATEGY, BUSINESS_ID) VALUES (NOW(), ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                historyDTO.getMarketInformation(),
                historyDTO.getCompetitorAnalysis(),
                historyDTO.getMarketTrends(),
                historyDTO.getRegulationInformation(),
                historyDTO.getMarketEntryStrategy(),
                historyDTO.getBusinessId()
        );
    }

    /* 설명. 시장 조회 이력 조회 */
    @Override
    @Transactional(readOnly = true)
    public List<MarketResearchHistoryDTO> findAllMarketResearchByUser(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userEmail);
        }

        Page<MarketResearch> marketResearchPage = marketResearchRepository.findAllByBusinessUser(user, pageable);

        return marketResearchPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private MarketResearchHistoryDTO convertToDTO(MarketResearch marketResearch) {
        return new MarketResearchHistoryDTO(
                marketResearch.getCreatedAt(),
                marketResearch.getMarketInformation(),
                marketResearch.getCompetitorAnalysis(),
                marketResearch.getMarketTrends(),
                marketResearch.getRegulationInformation(),
                marketResearch.getMarketEntityStrategy(),
                marketResearch.getBusiness().getId()
        );
    }
}