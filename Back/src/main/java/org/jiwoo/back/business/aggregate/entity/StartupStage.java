package org.jiwoo.back.business.aggregate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_startup_stage")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class StartupStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "NAME", nullable = false)
    private String name;
}