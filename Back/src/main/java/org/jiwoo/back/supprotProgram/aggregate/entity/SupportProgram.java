package org.jiwoo.back.supprotProgram.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@NoArgsConstructor
@Getter
@ToString
@Table(name = "tbl_support_program")
public class SupportProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    // 지원 사업 이름
    @Column(name = "NAME")
    private String name;

    // 지원 대상
    @Column(name = "TARGET")
    private String target;

    // 지원 규모
    @Column(name = "SCARE_OF_SUPPORT")
    private String scareOfSupport;

    // 지원 내용
    @Column(name = "SUPPORT_CONTENT")
    private String supportContent;

    // 지원 특징
    @Column(name = "SUPPORT_CHARACTERISTICS")
    private String supportCharacteristics;

    // 사업 소개 정보
    @Column(name = "SUPPORT_INFO")
    private String supportInfo;

    // 사업 년도
    @Column(name = "SUPPORT_YEAR")
    private int supportYear;

    // 지원 사업 URL
    @Column(name = "ORIGIN_URL")
    private String originUrl;

    @Builder
    public SupportProgram(int id, String name, String target, String scareOfSupport, String supportContent,
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
