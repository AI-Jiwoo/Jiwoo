package org.jiwoo.back.supprotProgram.service;

import org.jiwoo.back.supprotProgram.aggregate.dto.SupportProgramDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SupportProgramServiceTest {

    @Autowired
    private SupportProgramService supportProgramService;

    @DisplayName("지원 사업 입력 시 관련 사업 반환 테스트")
    @Test
    void insertSupportProgram() {

        // given
        SupportProgramDTO dto = SupportProgramDTO.builder()
                .name("농식품 판로지원")
                .target("농식품 분야 창업기업(창업 7년 이내)")
                .scareOfSupport("(예산현황) 8.05억원\\r\\n(지원규모) 세부 공고별 상이")
                .supportContent("온라인 운영매장 및 기획전 추진으로 판로지원")
                .supportCharacteristics("온라인 운영매장 및 기획전 추진으로 판로지원")
                .supportInfo("농식품 분야 벤처·창업기업의 판로확보 지원 및 유통채널 입점 지원")
                .supportYear(2024)
                .build();
        List<SupportProgramDTO> listDto = new ArrayList<>();
        listDto.add(dto);

        // when, then
        assertDoesNotThrow(() -> supportProgramService.insertSupportProgram(listDto));
    }
}