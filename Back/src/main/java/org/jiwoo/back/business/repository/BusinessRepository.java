package org.jiwoo.back.business.repository;

import org.jiwoo.back.business.aggregate.entity.Business;
import org.jiwoo.back.user.aggregate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Integer> {
    List<Business> findAllByUser(User user);
    Business findByBusinessName(String name);
    Optional<Object> findFirstByUser(User user);
}