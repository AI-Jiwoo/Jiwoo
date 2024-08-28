package org.jiwoo.back.user.repository;

import org.jiwoo.back.user.aggregate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Boolean existsByEmail(String email);

    User findByEmail(String email);
}
