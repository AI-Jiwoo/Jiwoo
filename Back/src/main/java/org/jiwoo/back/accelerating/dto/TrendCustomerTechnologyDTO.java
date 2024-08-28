package org.jiwoo.back.accelerating.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrendCustomerTechnologyDTO {
    private int businessId;
    private String trend;
    private String mainCustomers;
    private String technologyTrend;
}