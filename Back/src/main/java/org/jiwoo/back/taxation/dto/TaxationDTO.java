package org.jiwoo.back.taxation.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Date;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TaxationDTO {

    private String businessId;          // 사업 번호
    private String businessCode;        // 사업자 등록 번호
    private String businessType;        // 사업자유형 정보
    private String businessContent;     // 사업 내용

}
