package org.jiwoo.back.supprotProgram.controller;

import org.jiwoo.back.supprotProgram.aggregate.dto.SupportProgramDTO;
import org.jiwoo.back.supprotProgram.aggregate.vo.SupportProgramRequestVO;
import org.jiwoo.back.supprotProgram.service.SupportProgramService;
import org.jiwoo.back.user.aggregate.vo.MessageResponseVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/support_program")
public class SupportProgramController {

    private final SupportProgramService supportProgramService;

    @Autowired
    public SupportProgramController(SupportProgramService supportProgramService) {
        this.supportProgramService = supportProgramService;
    }

    @PostMapping("/insert")
    public ResponseEntity<MessageResponseVO> insertSupportProgram(@RequestBody SupportProgramRequestVO request) {

        try {
            List<SupportProgramDTO> supportProgramDTOs = new ArrayList<>();

            for (SupportProgramRequestVO.SupportData supportData : request.getData()) {
                supportProgramDTOs.add(SupportProgramDTO.builder()
                        .name(supportData.getSupt_biz_titl_nm())
                        .target(supportData.getBiz_supt_trgt_info())
                        .scareOfSupport(supportData.getBiz_supt_bdgt_info())
                        .supportContent(supportData.getBiz_supt_ctnt())
                        .supportCharacteristics(supportData.getSupt_biz_chrct())
                        .supportInfo(supportData.getSupt_biz_intrd_info())
                        .supportYear(supportData.getBiz_yr())
                        .originUrl(supportData.getDetl_pg_url())
                        .build());
            }

            supportProgramService.insertSupportProgram(supportProgramDTOs);

            return ResponseEntity.ok().body(new MessageResponseVO("지원 사업 추가 성공"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseVO("[ERROR] 지원 사업 추가 실패"));
        }
    }
}
