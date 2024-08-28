package org.jiwoo.back.category.repository;

import org.jiwoo.back.category.aggregate.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c.name FROM Business b JOIN b.businessCategories bc JOIN bc.category c WHERE b.id = :businessId")
    List<String> findCategoryNamesByBusinessId(@Param("businessId") int businessId);

    @Query("SELECT c.name FROM Category c")
    List<String> findAllCategoryNames();
}