package org.jiwoo.back.supprotProgram.aggregate.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
public class SupportProgramDTO {
    private int id;

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

    @Builder
    public SupportProgramDTO(int id, String name, String target, String scareOfSupport, String supportContent,
                             String supportCharacteristics, String supportInfo, int supportYear, String originUrl) {
        this.id = id;
        this.name = name;
        this.target = target;
        this.scareOfSupport = scareOfSupport;
        this.supportContent = supportContent;
        this.supportCharacteristics = supportCharacteristics;
        this.supportInfo = supportInfo;
        this.supportYear = supportYear;
        this.originUrl = originUrl;
    }
}
