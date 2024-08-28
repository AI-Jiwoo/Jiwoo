package org.jiwoo.back.taxation.repository;

import org.jiwoo.back.business.dto.BusinessDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaxationRepository {

//    @Query("SELECT new org.jiwoo.back.business.dto.BusinessDTO(b.id, b.businessName, b.businessNumber, b.businessScale, b.businessBudget, b.businessContent, b.businessPlatform, b.businessLocation, b.businessStartDate, b.nation, b.investmentStatus, b.customerType, b.user.id, b.startupStage.id, bc.category.id) FROM Business b LEFT JOIN b.businessCategories bc WHERE b.id = :id")
//    BusinessDTO findBusinessDTOById(@Param("id") int id);
}
