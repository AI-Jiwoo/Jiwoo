package org.jiwoo.back.category.service;

import org.jiwoo.back.category.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class CategoryServiceImplTest {

    private static final int BUSINESS_ID_WITH_CATEGORIES = 1;
    private static final int BUSINESS_ID_WITHOUT_CATEGORIES = 2;
    private static final String CATEGORY_1 = "IT";
    private static final String CATEGORY_2 = "인공지능";
    private static final String EXPECTED_CATEGORIES = "IT, 인공지능";
    private static final String NO_CATEGORY = "카테고리 없음";
    private static final List<String> CATEGORY_LIST = Arrays.asList(CATEGORY_1, CATEGORY_2);
    private static final List<String> EMPTY_CATEGORY_LIST = Collections.emptyList();

    private static final List<String> ALL_CATEGORY_NAMES = Arrays.asList("IT", "인공지능", "빅데이터", "클라우드");


    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("사업 ID로 카테고리 이름 조회 - 카테고리가 있는 경우")
    void getCategoryNameByBusinessId_WithCategories() {
        // Given
        when(categoryRepository.findCategoryNamesByBusinessId(BUSINESS_ID_WITH_CATEGORIES))
                .thenReturn(CATEGORY_LIST);

        // When
        String result = categoryService.getCategoryNameByBusinessId(BUSINESS_ID_WITH_CATEGORIES);

        // Then
        assertEquals(EXPECTED_CATEGORIES, result);
        verify(categoryRepository, times(1)).findCategoryNamesByBusinessId(BUSINESS_ID_WITH_CATEGORIES);
    }

    @Test
    @DisplayName("사업 ID로 카테고리 이름 조회 - 카테고리가 없는 경우")
    void getCategoryNameByBusinessId_WithoutCategories() {
        // Given
        when(categoryRepository.findCategoryNamesByBusinessId(BUSINESS_ID_WITHOUT_CATEGORIES))
                .thenReturn(EMPTY_CATEGORY_LIST);

        // When
        String result = categoryService.getCategoryNameByBusinessId(BUSINESS_ID_WITHOUT_CATEGORIES);

        // Then
        assertEquals(NO_CATEGORY, result);
        verify(categoryRepository, times(1)).findCategoryNamesByBusinessId(BUSINESS_ID_WITHOUT_CATEGORIES);
    }

    @Test
    @DisplayName("전체 카테고리 이름 조회")
    void getAllCategoryNames() {
        // Given
        when(categoryRepository.findAllCategoryNames()).thenReturn(ALL_CATEGORY_NAMES);

        // When
        List<String> result = categoryService.getAllCategoryNames();

        // Then
        assertEquals(ALL_CATEGORY_NAMES, result);
        verify(categoryRepository, times(1)).findAllCategoryNames();
    }

    @Test
    @DisplayName("전체 카테고리 이름 조회 - 카테고리가 없는 경우")
    void getAllCategoryNames_EmptyList() {
        // Given
        when(categoryRepository.findAllCategoryNames()).thenReturn(Collections.emptyList());

        // When
        List<String> result = categoryService.getAllCategoryNames();

        // Then
        assertEquals(Collections.emptyList(), result);
        verify(categoryRepository, times(1)).findAllCategoryNames();
    }
}