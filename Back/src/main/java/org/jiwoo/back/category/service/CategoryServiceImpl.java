package org.jiwoo.back.category.service;

import org.jiwoo.back.category.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public String getCategoryNameByBusinessId(int businessId) {
        List<String> categoryNames = categoryRepository.findCategoryNamesByBusinessId(businessId);
        return categoryNames.isEmpty() ? "카테고리 없음" : String.join(", ", categoryNames);
    }

    /* 설명. 카테고리 이름 전체조회 */
    @Override
    public List<String> getAllCategoryNames() {
        return categoryRepository.findAllCategoryNames();
    }


}