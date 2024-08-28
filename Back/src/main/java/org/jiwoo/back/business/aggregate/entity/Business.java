package org.jiwoo.back.business.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.jiwoo.back.accelerating.aggregate.entity.MarketResearch;
import org.jiwoo.back.user.aggregate.entity.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "tbl_business")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "BUSINESS_NAME", nullable = false)
    private String businessName;

    @Column(name = "BUSINESS_NUMBER", nullable = false)
    private String businessNumber;

    @Column(name = "BUSINESS_SCALE", nullable = false)
    private String businessScale;

    @Column(name = "BUSINESS_BUDGET", nullable = false)
    private double businessBudget;

    @Column(name = "BUSINESS_CONTENT", nullable = false)
    private String businessContent;

    @Column(name = "BUSINESS_PLATFORM", nullable = false)
    private String businessPlatform;

    @Column(name = "BUSINESS_LOCATION")
    private String businessLocation;

    @Column(name = "BUSINESS_START_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date businessStartDate;

    @Column(name = "NATION", nullable = false)
    private String nation;

    @Column(name = "INVESTMENT_STATUS", nullable = false)
    private String investmentStatus;

    @Column(name = "CUSTOMER_TYPE", nullable = false)
    private String customerType;

    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "STARTUP_STAGE_ID", nullable = false)
    private StartupStage startupStage;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MarketResearch> marketResearches;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BusinessCategory> businessCategories = new ArrayList<>();
}

