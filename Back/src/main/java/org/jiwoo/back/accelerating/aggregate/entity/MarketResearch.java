package org.jiwoo.back.accelerating.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.jiwoo.back.business.aggregate.entity.Business;
import java.time.LocalDateTime;


@Entity
@Table(name = "tbl_market_research")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketResearch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "CREATED_AT")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column(name = "MARKET_INFORMATION")
    private String marketInformation;

    @Column(name = "COMPETITOR_ANALYSIS")
    private String competitorAnalysis;

    @Column(name = "MARKET_TRENDS")
    private String marketTrends;

    @Column(name = "REGULATION_INFORMATION")
    private String regulationInformation;

    @Column(name = "MARKET_ENTITY_STRATEGY")
    private String marketEntityStrategy;

    @ManyToOne
    @JoinColumn(name = "BUSINESS_ID")
    private Business business;
}
