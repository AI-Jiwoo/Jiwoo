package org.jiwoo.back.supprotProgram.repository;

import org.jiwoo.back.supprotProgram.aggregate.entity.SupportProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportProgramRepository extends JpaRepository<SupportProgram, Integer> {

    SupportProgram findById(int id);
}
