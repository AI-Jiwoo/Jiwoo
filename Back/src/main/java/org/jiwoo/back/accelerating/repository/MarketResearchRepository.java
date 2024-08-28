package org.jiwoo.back.accelerating.repository;

import org.jiwoo.back.accelerating.aggregate.entity.MarketResearch;
import org.jiwoo.back.user.aggregate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketResearchRepository extends JpaRepository<MarketResearch, Integer> {
    Page<MarketResearch> findAllByBusinessUser(User user, Pageable pageable);
}
