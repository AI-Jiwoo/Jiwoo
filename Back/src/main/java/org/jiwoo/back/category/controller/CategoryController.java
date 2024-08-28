package org.jiwoo.back.category.controller;

import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.category.aggregate.entity.Category;
import org.jiwoo.back.category.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/category")
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /* 설명. 카테고리 이름 전체조회 */
    @GetMapping("/names")
    public List<String> listCategoryNames() {
        log.info("Fetching all category names");
        return categoryService.getAllCategoryNames();
    }
}