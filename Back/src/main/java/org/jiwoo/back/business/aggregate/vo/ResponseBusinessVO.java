package org.jiwoo.back.business.aggregate.vo;

import org.jiwoo.back.business.dto.BusinessDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ResponseBusinessVO {
    private String message;
    private List<BusinessDTO> business;
}