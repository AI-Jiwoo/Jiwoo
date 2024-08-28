package org.jiwoo.back.accelerating.service;

import org.jiwoo.back.accelerating.aggregate.vo.BusinessProposalVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseAnalyzeBusinessmodelVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponsePythonServerVO;
import org.jiwoo.back.accelerating.dto.BusinessInfoDTO;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.category.service.CategoryService;
import org.jiwoo.back.common.OpenAI.service.OpenAIService;
import org.jiwoo.back.common.exception.OpenAIResponseFailException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class BusinessmodelServiceImplTest {

    // 유사 서비스 조회
    private static final int BUSINESS_ID = 1;
    private static final String BUSINESS_PLATFORM = "SaaS";
    private static final String BUSINESS_SCALE = "중소기업";
    private static final String BUSINESS_FIELD = "IT";
    private static final String BUSINESS_START_DATE = "2023-01-01";
    private static final String INVESTMENT_STATUS = "시리즈 A";
    private static final String CUSTOMER_TYPE = "B2B";
    private static final String PYTHON_SERVER_URL = "http://localhost:8000/api";

    // 유사 서비스 비즈니스 모델 분석
    private static final String MOCK_ANALYSIS = "This is a mock analysis of the business models.";
    private static final String ERROR_MESSAGE = "비즈니스 모델 분석에 실패했습니다";

    // 사업 제안
    private static final String MOCK_PROPOSAL = "This is a mock business proposal.";

    @Mock
    private CategoryService categoryService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private OpenAIService openAIService;

    private BusinessmodelServiceImpl businessmodelService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        businessmodelService = new BusinessmodelServiceImpl(categoryService, restTemplate, openAIService);
        ReflectionTestUtils.setField(businessmodelService, "pythonServerUrl", PYTHON_SERVER_URL);
    }


    @Test
    @DisplayName("유사 서비스 조회 - 정상 케이스")
    void getSimilarServices_Success() throws ParseException {
        // Arrange
        BusinessDTO businessDTO = createBusinessDTO();
        when(categoryService.getCategoryNameByBusinessId(BUSINESS_ID)).thenReturn(BUSINESS_FIELD);

        List<ResponsePythonServerVO> mockResponse = Arrays.asList(
                new ResponsePythonServerVO("Company A", null, 0.9),
                new ResponsePythonServerVO("Company B", null, 0.8)
        );
        ResponseEntity<List<ResponsePythonServerVO>> mockResponseEntity = new ResponseEntity<>(mockResponse, HttpStatus.OK);

        when(restTemplate.exchange(
                eq(PYTHON_SERVER_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class)
        )).thenReturn(mockResponseEntity);

        // Act
        ResponseEntity<List<ResponsePythonServerVO>> result = businessmodelService.getSimilarServices(businessDTO);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(2, result.getBody().size());
        assertEquals("Company A", result.getBody().get(0).getBusinessName());
        assertEquals(0.9, result.getBody().get(0).getSimilarityScore());
    }

    @Test
    @DisplayName("유사 서비스 조회 - 카테고리 서비스 예외 발생")
    void getSimilarServices_CategoryServiceThrowsException() throws ParseException {
        // Arrange
        BusinessDTO businessDTO = createBusinessDTO();
        when(categoryService.getCategoryNameByBusinessId(BUSINESS_ID)).thenThrow(new RuntimeException("카테고리를 찾을 수 없습니다"));

        // Act
        ResponseEntity<List<ResponsePythonServerVO>> result = businessmodelService.getSimilarServices(businessDTO);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        assertEquals("Error", result.getBody().get(0).getBusinessName());
    }

    @Test
    @DisplayName("유사 서비스 조회 - RestTemplate 예외 발생")
    void getSimilarServices_RestTemplateThrowsException() throws ParseException {
        // Arrange
        BusinessDTO businessDTO = createBusinessDTO();
        when(categoryService.getCategoryNameByBusinessId(BUSINESS_ID)).thenReturn(BUSINESS_FIELD);

        when(restTemplate.exchange(
                eq(PYTHON_SERVER_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class)
        )).thenThrow(new RuntimeException("네트워크 오류"));

        // Act
        ResponseEntity<List<ResponsePythonServerVO>> result = businessmodelService.getSimilarServices(businessDTO);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        assertEquals("Error", result.getBody().get(0).getBusinessName());
    }

    private BusinessDTO createBusinessDTO() throws ParseException {
        BusinessDTO businessDTO = new BusinessDTO();
        businessDTO.setId(BUSINESS_ID);
        businessDTO.setBusinessPlatform(BUSINESS_PLATFORM);
        businessDTO.setBusinessScale(BUSINESS_SCALE);
        businessDTO.setInvestmentStatus(INVESTMENT_STATUS);
        businessDTO.setCustomerType(CUSTOMER_TYPE);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date startDate = sdf.parse(BUSINESS_START_DATE);
        businessDTO.setBusinessStartDate(startDate);

        return businessDTO;
    }


    @Test
    @DisplayName("비즈니스 모델 분석 - 정상 케이스")
    void analyzeBusinessModels_Success() throws OpenAIResponseFailException {
        // Arrange
        List<ResponsePythonServerVO> similarServices = Arrays.asList(
                new ResponsePythonServerVO("Company A", createBusinessInfoDTO(), 0.9),
                new ResponsePythonServerVO("Company B", createBusinessInfoDTO(), 0.8)
        );
        when(openAIService.generateAnswer(anyString())).thenReturn(MOCK_ANALYSIS);

        // Act
        ResponseEntity<ResponseAnalyzeBusinessmodelVO> result = businessmodelService.analyzeBusinessModels(similarServices);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(MOCK_ANALYSIS, result.getBody().getAnalysis());
        verify(openAIService, times(1)).generateAnswer(anyString());
    }

    @Test
    @DisplayName("비즈니스 모델 분석 - OpenAI 서비스 예외 발생")
    void analyzeBusinessModels_OpenAIServiceThrowsException() throws OpenAIResponseFailException {
        // Arrange
        List<ResponsePythonServerVO> similarServices = Arrays.asList(
                new ResponsePythonServerVO("Company A", createBusinessInfoDTO(), 0.9)
        );
        when(openAIService.generateAnswer(anyString())).thenThrow(new OpenAIResponseFailException("OpenAI API 오류"));

        // Act
        ResponseEntity<ResponseAnalyzeBusinessmodelVO> result = businessmodelService.analyzeBusinessModels(similarServices);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
        assertNotNull(result.getBody());
        assertNotNull(result.getBody().getAnalysis());
        assertTrue(result.getBody().getAnalysis().contains(ERROR_MESSAGE),
                "Expected error message not found in the response");
        verify(openAIService, times(1)).generateAnswer(anyString());
    }


    @Test
    @DisplayName("비즈니스 모델 제안 - 정상 케이스")
    void proposeBusinessModel_Success() throws OpenAIResponseFailException {
        // Arrange
        when(openAIService.generateAnswer(anyString())).thenReturn(MOCK_PROPOSAL);

        // Act
        ResponseEntity<BusinessProposalVO> result = businessmodelService.proposeBusinessModel(MOCK_ANALYSIS);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(MOCK_PROPOSAL, result.getBody().getProposal());
        verify(openAIService, times(1)).generateAnswer(anyString());
    }

    @Test
    @DisplayName("비즈니스 모델 제안 - OpenAI 서비스 예외 발생")
    void proposeBusinessModel_OpenAIServiceThrowsException() throws OpenAIResponseFailException {
        // Arrange
        when(openAIService.generateAnswer(anyString())).thenThrow(new OpenAIResponseFailException("OpenAI API 오류"));

        // Act
        ResponseEntity<BusinessProposalVO> result = businessmodelService.proposeBusinessModel(MOCK_ANALYSIS);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
        assertTrue(result.getBody().getProposal().contains("비즈니스 모델 제안에 실패했습니다"));
        verify(openAIService, times(1)).generateAnswer(anyString());
    }

    private BusinessInfoDTO createBusinessInfoDTO() {
        return new BusinessInfoDTO(
                BUSINESS_PLATFORM,
                BUSINESS_SCALE,
                BUSINESS_FIELD,
                BUSINESS_START_DATE,
                INVESTMENT_STATUS,
                CUSTOMER_TYPE
        );
    }

}