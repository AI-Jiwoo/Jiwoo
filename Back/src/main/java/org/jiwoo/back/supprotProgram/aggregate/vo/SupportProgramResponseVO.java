package org.jiwoo.back.supprotProgram.aggregate.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class SupportProgramResponseVO {

    // 지원 사업명
    private String name;

    // 지원 대상
    private String target;

    // 지원 규모
    private String scareOfSupport;

    // 지원 내용
    private String supportContent;

    // 지원 특징
    private String supportCharacteristics;

    // 사업 소개 정보
    private String supportInfo;

    // 사업 년도
    private int supportYear;

    // 지원 사업 URL
    private String originUrl;
}
