package org.jiwoo.back.business.service;

import org.jiwoo.back.business.aggregate.entity.Business;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.business.repository.BusinessMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.text.ParseException;

class BusinessServiceImplTest {

    @Mock
    private BusinessMapper businessMapper;

    @InjectMocks
    private BusinessServiceImpl businessService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @DisplayName("사업 ID로 사업 조회")
    @Test
    void findBusinessById() throws ParseException {
        // Given
        int businessId = 1;
        Business mockBusiness = createMockBusiness(businessId, "Test Business", 1);

        when(businessMapper.findById(businessId)).thenReturn(mockBusiness);

        // When
        BusinessDTO result = businessService.findBusinessById(businessId);

        // Then
        assertNotNull(result);
        assertEquals(businessId, result.getId());
        assertEquals("Test Business", result.getBusinessName());
        assertEquals("123-45-67890", result.getBusinessNumber());
        assertEquals("중소기업", result.getBusinessScale());
        assertEquals(1000000.0, result.getBusinessBudget(), 0.001);
        assertEquals("Test content", result.getBusinessContent());
        assertEquals("온라인 플랫폼", result.getBusinessPlatform());
        assertEquals("서울", result.getBusinessLocation());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        assertEquals("2023-01-01", sdf.format(result.getBusinessStartDate()));
        assertEquals("대한민국", result.getNation());
        assertEquals("시드", result.getInvestmentStatus());
        assertEquals("B2C", result.getCustomerType());
        assertEquals(1, result.getUserId());
        assertEquals(2, result.getStartupStageId());

        verify(businessMapper, times(1)).findById(businessId);
    }

    @DisplayName("사업 ID 없는 경우 Null 반환")
    @Test
    void findBusinessById_NotFound() {
        // Given
        int businessId = 999;
        when(businessMapper.findById(businessId)).thenReturn(null);

        // When
        BusinessDTO result = businessService.findBusinessById(businessId);

        // Then
        assertNull(result);
        verify(businessMapper, times(1)).findById(businessId);
    }

    private Business createMockBusiness(int id, String name, int userId) throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date startDate = sdf.parse("2023-01-01");

        return new Business(
                id,
                name,
                "123-45-67890",
                "중소기업",
                1000000.0,
                "Test content",
                "온라인 플랫폼",
                "서울",
                startDate,
                "대한민국",
                "시드",
                "B2C",
                userId,
                2
        );
    }
}