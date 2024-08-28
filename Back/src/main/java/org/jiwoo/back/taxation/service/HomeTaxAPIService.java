package org.jiwoo.back.taxation.service;

import org.jiwoo.back.taxation.dto.TaxationDTO;

public interface HomeTaxAPIService {

    // 홈택스 api로 사업자 유형 가져오기
    TaxationDTO getTaxationInfo(int businessId);

    String getBusinessType(String businessNumber);
}
