package org.jiwoo.back.category.service;

import org.jiwoo.back.category.aggregate.entity.Category;

import java.util.List;

public interface CategoryService {
    String getCategoryNameByBusinessId(int businessId);
    List<String> getAllCategoryNames();
}