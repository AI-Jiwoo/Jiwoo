package org.jiwoo.back.accelerating.aggregate.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jiwoo.back.accelerating.dto.BusinessInfoDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponsePythonServerVO {
    private String businessName;
    private BusinessInfoDTO info;
    private double similarityScore;
}
