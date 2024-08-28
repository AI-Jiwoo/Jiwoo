package org.jiwoo.back.taxation.aggregate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity(name = "taxation")
@Table(name = "tbl_taxation")
public class Taxation {

    @Id
    @Column(name = "ID")
    private int id;                         //세무코드

    @Column(name = "TOTAL_SALES")
    private BigDecimal totalSales;              // 총 매출액

    @Column(name = "GROSS_INCOME")
    private BigDecimal grossIncome;             // 총 소득

    @Column(name = "NET_SALES")
    private BigDecimal netSales;                // 순 매출액

    @Column(name = "START_DATE")
    private Date startDate;                 // 시작일자

    @Column(name = "LAST_DATE")
    private Date lastDate;                  // 마지막 일자

    @Column(name = "LOSS_STATUS")
    private String lossStatus;              // 적자여부

    @Column(name = "INCOME_TAX")
    private BigDecimal incomeTax;               // 소득세

    @Column(name = "BUSINESS_ID")
    private int businessId;                 // 사업코드
}

