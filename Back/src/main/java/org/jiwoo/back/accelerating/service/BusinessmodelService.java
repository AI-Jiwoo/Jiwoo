package org.jiwoo.back.accelerating.service;

import org.jiwoo.back.accelerating.aggregate.vo.BusinessProposalVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseAnalyzeBusinessmodelVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponsePythonServerVO;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface BusinessmodelService {
    ResponseEntity<List<ResponsePythonServerVO>> getSimilarServices(BusinessDTO businessDTO);
    ResponseEntity<ResponseAnalyzeBusinessmodelVO> analyzeBusinessModels(List<ResponsePythonServerVO> similarServices);
    ResponseEntity<BusinessProposalVO> proposeBusinessModel(String analysis);
}
