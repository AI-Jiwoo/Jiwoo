package org.jiwoo.back.business.repository;

import org.jiwoo.back.business.aggregate.entity.StartupStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StartupStageRepository extends JpaRepository<StartupStage, Integer> {
}