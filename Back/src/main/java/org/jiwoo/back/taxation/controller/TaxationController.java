package org.jiwoo.back.taxation.controller;

import org.jiwoo.back.business.aggregate.vo.ResponseBusinessVO;
import org.jiwoo.back.taxation.aggregate.vo.ResponseTaxationVO;
import org.jiwoo.back.taxation.dto.TaxationDTO;
import org.jiwoo.back.taxation.service.HomeTaxAPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/taxation")
public class TaxationController {

    private final HomeTaxAPIService homeTaxAPIService;

    @Autowired
    public TaxationController(HomeTaxAPIService homeTaxAPIService) {
        this.homeTaxAPIService = homeTaxAPIService;

    }

    @PostMapping(value = "/homeTax", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<ResponseTaxationVO> getTaxation(@RequestParam("businessId") int businessId) {

        try{
            TaxationDTO taxationDTO = homeTaxAPIService.getTaxationInfo(businessId);
            return ResponseEntity.ok(new ResponseTaxationVO(HttpStatus.OK, "홈택스API 조회가 완료되었습니다.", taxationDTO));
        }catch(Exception e){
            return ResponseEntity.badRequest().body(new ResponseTaxationVO(HttpStatus.BAD_REQUEST, "홈택스 API 조회 실패 :" + e.getMessage(), null));
        }

    }


}
