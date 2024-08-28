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
@Table(name = "tbl_business_support_program")
public class SupportProgramBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "BUSINESS_ID")
    private int businessId;

    @Column(name = "SUPPORT_PROGRAM_ID")
    private int supportProgramId;

    @Builder
    public SupportProgramBusiness(int id, int businessId, int supportProgramId) {
        this.id = id;
        this.businessId = businessId;
        this.supportProgramId = supportProgramId;
    }
}
