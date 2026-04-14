package com.campusflow.repository;

import com.campusflow.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySubject_Classroom_ClassIdOrderByDayOfWeekAscStartTimeAsc(String classId);
    List<Timetable> findBySubject_IdOrderByDayOfWeekAsc(Long subjectId);
    void deleteBySubject_Classroom_ClassId(String classId);
}
