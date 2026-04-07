package com.campusflow.service;

import com.campusflow.dto.AttendanceRequest;
import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    public void markAttendance(AttendanceRequest req, User markedBy) {
        Subject subject = subjectRepository.findById(req.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        for (AttendanceRequest.AttendanceRecord record : req.getRecords()) {
            Student student = studentRepository.findById(record.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + record.getStudentId()));
            Attendance attendance = attendanceRepository
                .findByStudent_RegisterNumberAndSubject_IdAndDateAndClassHour(
                    record.getStudentId(), req.getSubjectId(), req.getDate(), req.getClassHour())
                .orElse(new Attendance());
            attendance.setStudent(student);
            attendance.setSubject(subject);
            attendance.setDate(req.getDate());
            attendance.setClassHour(req.getClassHour());
            attendance.setIsPresent(record.getIsPresent());
            attendance.setMarkedBy(markedBy);
            attendanceRepository.save(attendance);
        }
    }

    public List<Attendance> getStudentAttendance(String studentId, Long subjectId) {
        if (subjectId != null)
            return attendanceRepository.findByStudent_RegisterNumberAndSubject_Id(studentId, subjectId);
        return attendanceRepository.findByStudent_RegisterNumber(studentId);
    }

    public List<Map<String, Object>> getAttendanceSummary(String studentId) {
        List<Object[]> raw = attendanceRepository.getAttendanceSummary(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Long subjectId = (Long) row[0];
            long total = ((Number) row[1]).longValue();
            long attended = ((Number) row[2]).longValue();
            double pct = total > 0 ? Math.round((attended * 100.0 / total) * 100.0) / 100.0 : 0;
            subjectRepository.findById(subjectId).ifPresent(sub -> {
                Map<String, Object> map = new HashMap<>();
                map.put("course_name", sub.getCourse().getCourseName());
                map.put("course_code", sub.getCourse().getCourseCode());
                map.put("total_classes", total);
                map.put("attended", attended);
                map.put("percentage", pct);
                result.add(map);
            });
        }
        return result;
    }

    public List<Attendance> getSubjectAttendance(Long subjectId, LocalDate date) {
        if (date != null)
            return attendanceRepository.findBySubject_IdAndDate(subjectId, date);
        return attendanceRepository.findBySubject_Id(subjectId);
    }
}
