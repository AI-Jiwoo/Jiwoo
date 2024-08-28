package org.jiwoo.back.accelerating.service;

import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.accelerating.aggregate.vo.BusinessProposalVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseAnalyzeBusinessmodelVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponsePythonServerVO;
import org.jiwoo.back.accelerating.dto.BusinessInfoDTO;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.category.service.CategoryService;
import org.jiwoo.back.common.OpenAI.service.OpenAIService;
import org.jiwoo.back.common.exception.OpenAIResponseFailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class BusinessmodelServiceImpl implements BusinessmodelService {

    private final CategoryService categoryService;
    private final RestTemplate restTemplate;
    private final OpenAIService openAIService;

    private static final String ERROR_MESSAGE = "비즈니스 모델 분석에 실패했습니다";

    @Value("${python.server.url.search}")
    private String pythonServerUrl;

    @Autowired
    public BusinessmodelServiceImpl(CategoryService categoryService, @Qualifier("defaultTemplate") RestTemplate restTemplate, OpenAIService openAIService) {
        this.categoryService = categoryService;
        this.restTemplate = restTemplate;
        this.openAIService = openAIService;
    }

    @Override
    public ResponseEntity<List<ResponsePythonServerVO>> getSimilarServices(BusinessDTO businessDTO) {
        try {
            String categoryNames = categoryService.getCategoryNameByBusinessId(businessDTO.getId());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = createRequestBody(businessDTO);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<List<ResponsePythonServerVO>> response = restTemplate.exchange(
                    pythonServerUrl,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<List<ResponsePythonServerVO>>() {}
            );
            log.info("Similar services retrieved successfully for business ID: {}", businessDTO.getId());
            return response;
        } catch (Exception e) {
            log.error("Error retrieving similar services for business ID: {}", businessDTO.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of(new ResponsePythonServerVO("Error", null, 0.0)));
        }
    }

    private Map<String, Object> createRequestBody(BusinessDTO businessDTO) {
        Map<String, Object> requestBody = new HashMap<>();
        String categoryName = null;
        try {
            categoryName = categoryService.getCategoryNameByBusinessId(businessDTO.getId());
        } catch (Exception e) {
            log.warn("Failed to retrieve category name for business ID: {}", businessDTO.getId(), e);
            categoryName = "Unknown";
        }
        requestBody.put("businessPlatform", businessDTO.getBusinessPlatform());
        requestBody.put("businessScale", businessDTO.getBusinessScale());
        requestBody.put("business_field", categoryName);
        requestBody.put("businessStartDate", formatDate(businessDTO.getBusinessStartDate()));
        requestBody.put("investmentStatus", businessDTO.getInvestmentStatus());
        requestBody.put("customerType", businessDTO.getCustomerType());
        return requestBody;
    }

    private String formatDate(Date date) {
        if (date == null) return null;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(date);
    }


    /* 설명. 조회한 서비스 비즈니스 모델 분석 */
    @Override
    public ResponseEntity<ResponseAnalyzeBusinessmodelVO> analyzeBusinessModels(List<ResponsePythonServerVO> similarServices) {
        try {
            String prompt = createPromptForAnalysis(similarServices);
            String analysis = openAIService.generateAnswer(prompt);
            return ResponseEntity.ok(new ResponseAnalyzeBusinessmodelVO(analysis));
        } catch (OpenAIResponseFailException e) {
            log.error("Error analyzing business models", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseAnalyzeBusinessmodelVO(ERROR_MESSAGE + ": " + e.getMessage()));
        }
    }
    private String createPromptForAnalysis(List<ResponsePythonServerVO> similarServices) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음 유사 서비스들의 비즈니스 모델을 분석해주세요:\n\n");

        for (ResponsePythonServerVO service : similarServices) {
            prompt.append("회사명: ").append(service.getBusinessName()).append("\n");
            prompt.append("비즈니스 정보: ").append(getBusinessInfoString(service.getInfo())).append("\n");
            prompt.append("유사도 점수: ").append(service.getSimilarityScore()).append("\n\n");
        }

        prompt.append("위 서비스들의 비즈니스 모델에 대해 간결한 분석을 제공해주세요. 수익구조, 공통 전략, 독특한 접근 방식, 그리고 개선 가능한 영역을 포함해 주세요.");

        return prompt.toString();
    }

    private String getBusinessInfoString(BusinessInfoDTO info) {
        return "플랫폼: " + info.getBusinessPlatform() +
                ", 규모: " + info.getBusinessScale() +
                ", 분야: " + info.getBusinessField() +
                ", 시작일: " + info.getBusinessStartDate() +
                ", 투자 상태: " + info.getInvestmentStatus() +
                ", 고객 유형: " + info.getCustomerType();
    }

    /* 설명. 서비스 기반 비즈니스 제안 */
    @Override
    public ResponseEntity<BusinessProposalVO> proposeBusinessModel(String analysis) {
        try {
            String prompt = createPromptForProposal(analysis);
            String proposal = openAIService.generateAnswer(prompt);
            return ResponseEntity.ok(new BusinessProposalVO(proposal));
        } catch (OpenAIResponseFailException e) {
            log.error("Error proposing business model", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BusinessProposalVO("비즈니스 모델 제안에 실패했습니다: " + e.getMessage()));
        }
    }

    private String createPromptForProposal(String analysis) {
        return "다음은 비즈니스 모델 분석 결과입니다:\n\n" + analysis +
                "\n\n이 분석을 바탕으로 혁신적이고 실행 가능한 비즈니스 모델을 제안해주세요. " +
                "제안에는 다음 요소를 포함해야 합니다:\n" +
                "1. 핵심 가치 제안\n" +
                "2. 목표 고객 세그먼트\n" +
                "3. 수익 모델\n" +
                "4. 주요 자원 및 활동\n" +
                "5. 차별화 전략\n";
    }


}

