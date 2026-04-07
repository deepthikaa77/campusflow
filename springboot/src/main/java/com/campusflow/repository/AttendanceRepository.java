package com.campusflow.repository;

import com.campusflow.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudent_RegisterNumber(String registerNumber);

    List<Attendance> findByStudent_RegisterNumberAndSubject_Id(String registerNumber, Long subjectId);

    List<Attendance> findBySubject_IdAndDate(Long subjectId, LocalDate date);

    List<Attendance> findBySubject_Id(Long subjectId);

    Optional<Attendance> findByStudent_RegisterNumberAndSubject_IdAndDateAndClassHour(
        String registerNumber, Long subjectId, LocalDate date, Integer classHour);

    long countByStudent_RegisterNumber(String registerNumber);
    long countByStudent_RegisterNumberAndIsPresent(String registerNumber, Boolean isPresent);

    @Query("SELECT a.subject.id, COUNT(a), SUM(CASE WHEN a.isPresent = true THEN 1 ELSE 0 END) " +
           "FROM Attendance a WHERE a.student.registerNumber = :regNum GROUP BY a.subject.id")
    List<Object[]> getAttendanceSummary(@Param("regNum") String registerNumber);
}
