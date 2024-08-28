package org.jiwoo.back.supprotProgram.service;

import org.jiwoo.back.supprotProgram.aggregate.dto.SupportProgramDTO;

import java.util.List;

public interface SupportProgramService {
    void insertSupportProgram(List<SupportProgramDTO> supportProgramDTO);
    List<SupportProgramDTO> recommendSupportProgram();
}
