package org.jiwoo.back.business.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.jiwoo.back.category.aggregate.entity.Category;

@Entity
@Table(name = "tbl_business_category")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "BUSINESS_ID")
    private Business business;

    @ManyToOne
    @JoinColumn(name = "CATEGORY_ID")
    private Category category;
}
