package org.jiwoo.back.category.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.jiwoo.back.business.aggregate.entity.BusinessCategory;

import java.util.List;

@Entity
@Table(name = "tbl_category")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "MARKET_SCALE")
    private double marketScale;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BusinessCategory> businessCategories;
}
