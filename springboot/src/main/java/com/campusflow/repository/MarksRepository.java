package com.campusflow.repository;

import com.campusflow.model.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent_RegisterNumber(String registerNumber);
    List<Marks> findBySubject_Id(Long subjectId);
    List<Marks> findBySubject_IdAndExamType_Id(Long subjectId, Integer examTypeId);
    Optional<Marks> findByStudent_RegisterNumberAndSubject_IdAndExamType_Id(String regNum, Long subjectId, Integer examTypeId);
}
