package org.jiwoo.back.business.repository;

import org.jiwoo.back.business.aggregate.entity.BusinessCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessCategoryRepository extends JpaRepository<BusinessCategory, Integer> {
}