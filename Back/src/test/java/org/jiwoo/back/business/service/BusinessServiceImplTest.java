package org.jiwoo.back.business.service;

import org.jiwoo.back.business.aggregate.entity.Business;
import org.jiwoo.back.business.aggregate.entity.BusinessCategory;
import org.jiwoo.back.business.aggregate.entity.StartupStage;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.business.repository.BusinessCategoryRepository;
import org.jiwoo.back.business.repository.BusinessRepository;
import org.jiwoo.back.business.repository.StartupStageRepository;
import org.jiwoo.back.category.aggregate.entity.Category;
import org.jiwoo.back.category.repository.CategoryRepository;
import org.jiwoo.back.category.service.CategoryService;
import org.jiwoo.back.user.aggregate.entity.User;
import org.jiwoo.back.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.*;
import java.text.SimpleDateFormat;
import java.text.ParseException;

class BusinessServiceImplTest {
    // 사업 정보 조회
    private static final int BUSINESS_ID = 1;
    private static final int NON_EXISTENT_BUSINESS_ID = 999;
    private static final String BUSINESS_NAME = "Test Business";
    private static final String BUSINESS_NUMBER = "123-45-67890";
    private static final String BUSINESS_SCALE = "중소기업";
    private static final double BUSINESS_BUDGET = 1000000.0;
    private static final String BUSINESS_CONTENT = "Test content";
    private static final String BUSINESS_PLATFORM = "온라인 플랫폼";
    private static final String BUSINESS_LOCATION = "서울";
    private static final String BUSINESS_START_DATE = "2023-01-01";
    private static final String NATION = "대한민국";
    private static final String INVESTMENT_STATUS = "시드";
    private static final String CUSTOMER_TYPE = "B2C";
    private static final double DELTA = 0.001;

    // 사업 정보 저장
    private static final String USER_EMAIL = "test@example.com";
    private static final int USER_ID = 1;
    private static final int STARTUP_STAGE_ID = 1;
    private static final String STARTUP_STAGE_NAME = "초기 단계";
    private static final List<Integer> CATEGORY_IDS = Arrays.asList(1, 2);
    private static final String VECTOR_DB_URL = "http://localhost:8000/insert";
    private static final String VECTOR_DB_SUCCESS_RESPONSE = "Success";
    private static final String VECTOR_DB_FAIL_MESSAGE = "VectorDB 저장 실패";

    // 사용자의 비즈니스 프로필 조회
    private static final String CURRENT_USER_EMAIL = "current@example.com";
    private static final int CURRENT_USER_BUSINESS_ID = 5;
    private static final String CURRENT_USER_BUSINESS_NAME = "Current User Business";

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StartupStageRepository startupStageRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BusinessCategoryRepository businessCategoryRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private BusinessServiceImpl businessService;

    @Mock
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        businessService = new BusinessServiceImpl(
                businessRepository,
                userRepository,
                startupStageRepository,
                categoryService,
                categoryRepository,
                businessCategoryRepository,
                restTemplate
        );
        ReflectionTestUtils.setField(businessService, "pythonInsertUrl", VECTOR_DB_URL);
    }

    @DisplayName("사업 ID로 사업 조회")
    @Test
    void findBusinessById() throws ParseException {
        // Given
        Business mockBusiness = createMockBusiness(BUSINESS_ID, BUSINESS_NAME);
        User mockUser = createMockUser();
        StartupStage mockStartupStage = createMockStartupStage();
        setFieldWithReflection(mockBusiness, "user", mockUser);
        setFieldWithReflection(mockBusiness, "startupStage", mockStartupStage);

        when(businessRepository.findById(BUSINESS_ID)).thenReturn(Optional.of(mockBusiness));

        // When
        BusinessDTO result = businessService.findBusinessById(BUSINESS_ID);

        // Then
        assertNotNull(result);
        assertEquals(BUSINESS_ID, result.getId());
        assertEquals(BUSINESS_NAME, result.getBusinessName());
        assertEquals(BUSINESS_NUMBER, result.getBusinessNumber());
        assertEquals(BUSINESS_SCALE, result.getBusinessScale());
        assertEquals(BUSINESS_BUDGET, result.getBusinessBudget(), DELTA);
        assertEquals(BUSINESS_CONTENT, result.getBusinessContent());
        assertEquals(BUSINESS_PLATFORM, result.getBusinessPlatform());
        assertEquals(BUSINESS_LOCATION, result.getBusinessLocation());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        assertEquals(BUSINESS_START_DATE, sdf.format(result.getBusinessStartDate()));
        assertEquals(NATION, result.getNation());
        assertEquals(INVESTMENT_STATUS, result.getInvestmentStatus());
        assertEquals(CUSTOMER_TYPE, result.getCustomerType());

        verify(businessRepository, times(1)).findById(BUSINESS_ID);
    }

    @DisplayName("사업 ID 없는 경우 Null 반환")
    @Test
    void findBusinessById_NotFound() {
        // Given
        when(businessRepository.findById(NON_EXISTENT_BUSINESS_ID)).thenReturn(Optional.empty());

        // When
        BusinessDTO result = businessService.findBusinessById(NON_EXISTENT_BUSINESS_ID);

        // Then
        assertNull(result);
        verify(businessRepository, times(1)).findById(NON_EXISTENT_BUSINESS_ID);
    }

    private Business createMockBusiness(int id, String name) throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date startDate = sdf.parse(BUSINESS_START_DATE);

        StartupStage mockStartupStage = createMockStartupStage();

        Business business = Business.builder()
                .id(id)
                .businessName(name)
                .businessNumber(BUSINESS_NUMBER)
                .businessScale(BUSINESS_SCALE)
                .businessBudget(BUSINESS_BUDGET)
                .businessContent(BUSINESS_CONTENT)
                .businessPlatform(BUSINESS_PLATFORM)
                .businessLocation(BUSINESS_LOCATION)
                .businessStartDate(startDate)
                .nation(NATION)
                .investmentStatus(INVESTMENT_STATUS)
                .customerType(CUSTOMER_TYPE)
                .businessCategories(new ArrayList<>())
                .startupStage(mockStartupStage)
                .build();

        return business;
    }

    private User createMockUser() {
        User mockUser = User.builder().email(USER_EMAIL).build();
        setFieldWithReflection(mockUser, "id", USER_ID);
        return mockUser;
    }

    private StartupStage createMockStartupStage() {
        StartupStage mockStartupStage = StartupStage.builder().name(STARTUP_STAGE_NAME).build();
        setFieldWithReflection(mockStartupStage, "id", STARTUP_STAGE_ID);
        return mockStartupStage;
    }

    @DisplayName("사업 정보 저장 - 카테고리 및 VectorDB 포함")
    @Test
    void saveBusiness_WithCategoriesAndVectorDB() throws ParseException {
        // Given
        BusinessDTO businessDTO = createBusinessDTO();
        businessDTO.setCategoryIds(CATEGORY_IDS);
        User mockUser = createMockUser();
        StartupStage mockStartupStage = createMockStartupStage();
        List<Category> mockCategories = createMockCategories();

        Business mockSavedBusiness = createMockBusiness(BUSINESS_ID, BUSINESS_NAME);
        setFieldWithReflection(mockSavedBusiness, "user", mockUser);
        setFieldWithReflection(mockSavedBusiness, "startupStage", mockStartupStage);
        setFieldWithReflection(mockSavedBusiness, "businessCategories", new ArrayList<>());

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(mockUser);
        when(startupStageRepository.findById(STARTUP_STAGE_ID)).thenReturn(Optional.of(mockStartupStage));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(mockCategories.get(0)));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(mockCategories.get(1)));
        when(businessRepository.save(any(Business.class))).thenReturn(mockSavedBusiness);
        when(categoryService.getCategoryNameByBusinessId(anyInt())).thenReturn("Category1, Category2");
        when(restTemplate.exchange(
                eq(VECTOR_DB_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(new ResponseEntity<>(VECTOR_DB_SUCCESS_RESPONSE, HttpStatus.OK));

        // When
        BusinessDTO result = businessService.saveBusiness(businessDTO, USER_EMAIL);

        // Then
        assertNotNull(result);
        assertEquals(BUSINESS_ID, result.getId());
        assertEquals(BUSINESS_NAME, result.getBusinessName());
        assertEquals(CATEGORY_IDS, result.getCategoryIds());

        verify(businessRepository, times(1)).save(any(Business.class));
        verify(userRepository, times(1)).findByEmail(USER_EMAIL);
        verify(startupStageRepository, times(1)).findById(STARTUP_STAGE_ID);
        verify(categoryRepository, times(2)).findById(anyInt());
        verify(businessCategoryRepository, times(2)).save(any(BusinessCategory.class));
        verify(categoryService, times(1)).getCategoryNameByBusinessId(anyInt());
        verify(restTemplate, times(1)).exchange(
                eq(VECTOR_DB_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @DisplayName("사업 정보 저장 - VectorDB 저장 실패")
    @Test
    void saveBusiness_VectorDBSaveFails() throws ParseException {
        // Given
        BusinessDTO businessDTO = createBusinessDTO();
        User mockUser = createMockUser();
        StartupStage mockStartupStage = createMockStartupStage();
        List<Category> mockCategories = createMockCategories();

        Business mockSavedBusiness = createMockBusiness(BUSINESS_ID, BUSINESS_NAME);
        setFieldWithReflection(mockSavedBusiness, "user", mockUser);
        setFieldWithReflection(mockSavedBusiness, "startupStage", mockStartupStage);

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(mockUser);
        when(startupStageRepository.findById(STARTUP_STAGE_ID)).thenReturn(Optional.of(mockStartupStage));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(mockCategories.get(0)));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(mockCategories.get(1)));
        when(businessRepository.save(any(Business.class))).thenReturn(mockSavedBusiness);
        when(categoryService.getCategoryNameByBusinessId(anyInt())).thenReturn("Category1, Category2");
        when(restTemplate.exchange(
                eq(VECTOR_DB_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        )).thenThrow(new RuntimeException(VECTOR_DB_FAIL_MESSAGE));

        // When
        BusinessDTO result = businessService.saveBusiness(businessDTO, USER_EMAIL);

        // Then
        assertNotNull(result);
        assertEquals(BUSINESS_ID, result.getId());
        assertEquals(BUSINESS_NAME, result.getBusinessName());

        verify(businessRepository, times(1)).save(any(Business.class));
        verify(categoryRepository, times(businessDTO.getCategoryIds().size())).findById(anyInt());
        verify(businessCategoryRepository, times(businessDTO.getCategoryIds().size())).save(any(BusinessCategory.class));
        verify(categoryService, times(1)).getCategoryNameByBusinessId(anyInt());
        verify(restTemplate, times(1)).exchange(
                eq(VECTOR_DB_URL),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        );
    }



    private List<Category> createMockCategories() {
        Category category1 = new Category();
        setFieldWithReflection(category1, "id", 1);
        setFieldWithReflection(category1, "name", "카테고리1");

        Category category2 = new Category();
        setFieldWithReflection(category2, "id", 2);
        setFieldWithReflection(category2, "name", "카테고리2");

        return Arrays.asList(category1, category2);
    }


    private BusinessDTO createBusinessDTO() throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date startDate = sdf.parse(BUSINESS_START_DATE);

        return new BusinessDTO(
                0, // ID는 0으로 설정 (새로운 비즈니스이므로)
                BUSINESS_NAME,
                BUSINESS_NUMBER,
                BUSINESS_SCALE,
                BUSINESS_BUDGET,
                BUSINESS_CONTENT,
                BUSINESS_PLATFORM,
                BUSINESS_LOCATION,
                startDate,
                NATION,
                INVESTMENT_STATUS,
                CUSTOMER_TYPE,
                USER_ID,
                STARTUP_STAGE_ID,
                CATEGORY_IDS
        );
    }

    private void setFieldWithReflection(Object object, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(object, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to set field value using reflection", e);
        }
    }

    @DisplayName("현재 사용자의 비즈니스 프로필 조회")
    @Test
    void getCurrentUserBusinessProfile() throws ParseException {
        // Given
        User mockCurrentUser = createMockUser();
        setFieldWithReflection(mockCurrentUser, "email", CURRENT_USER_EMAIL);
        Business mockCurrentUserBusiness = createMockBusiness(CURRENT_USER_BUSINESS_ID, CURRENT_USER_BUSINESS_NAME);
        setFieldWithReflection(mockCurrentUserBusiness, "user", mockCurrentUser);

        when(userRepository.findByEmail(CURRENT_USER_EMAIL)).thenReturn(mockCurrentUser);
        when(businessRepository.findFirstByUser(mockCurrentUser)).thenReturn(Optional.of(mockCurrentUserBusiness));

        // When
        BusinessDTO result = businessService.getCurrentUserBusinessProfile(CURRENT_USER_EMAIL);

        // Then
        assertNotNull(result);
        assertEquals(CURRENT_USER_BUSINESS_ID, result.getId());
        assertEquals(CURRENT_USER_BUSINESS_NAME, result.getBusinessName());
        assertEquals(CURRENT_USER_EMAIL, mockCurrentUser.getEmail());

        verify(userRepository, times(1)).findByEmail(CURRENT_USER_EMAIL);
        verify(businessRepository, times(1)).findFirstByUser(mockCurrentUser);
    }

    @DisplayName("현재 사용자의 비즈니스 프로필이 없을 경우 예외 발생")
    @Test
    void getCurrentUserBusinessProfile_NotFound() {
        // Given
        User mockCurrentUser = createMockUser();
        setFieldWithReflection(mockCurrentUser, "email", CURRENT_USER_EMAIL);

        when(userRepository.findByEmail(CURRENT_USER_EMAIL)).thenReturn(mockCurrentUser);
        when(businessRepository.findFirstByUser(mockCurrentUser)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> businessService.getCurrentUserBusinessProfile(CURRENT_USER_EMAIL));

        verify(userRepository, times(1)).findByEmail(CURRENT_USER_EMAIL);
        verify(businessRepository, times(1)).findFirstByUser(mockCurrentUser);
    }
}
