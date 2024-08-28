package org.jiwoo.back.accelerating.controller;

import org.jiwoo.back.accelerating.aggregate.vo.BusinessProposalVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponseAnalyzeBusinessmodelVO;
import org.jiwoo.back.accelerating.aggregate.vo.ResponsePythonServerVO;
import org.jiwoo.back.accelerating.service.BusinessmodelService;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/business-model")
public class BusinessmodelController {

    private final BusinessmodelService businessmodelService;

    @Autowired
    public BusinessmodelController(BusinessmodelService businessmodelService) {
        this.businessmodelService = businessmodelService;
    }

    /* 설명. 유사 서비스 조회 */
    @PostMapping("/similar-services")
    public ResponseEntity<List<ResponsePythonServerVO>> getSimilarServices(@RequestBody BusinessDTO businessDTO) {
        return businessmodelService.getSimilarServices(businessDTO);
    }

    /* 설명. 조회한 서비스 비즈니스 모델 분석 */
    @PostMapping("/analyze")
    public ResponseEntity<ResponseAnalyzeBusinessmodelVO> analyzeBusinessModels(@RequestBody List<ResponsePythonServerVO> similarServices) {
        return businessmodelService.analyzeBusinessModels(similarServices);
    }

    /* 설명. 서비스 기반 비즈니스 제안 */
    @PostMapping("/propose")
    public ResponseEntity<BusinessProposalVO> proposeBusinessModel(@RequestBody String analysis) {
        return businessmodelService.proposeBusinessModel(analysis);
    }
}