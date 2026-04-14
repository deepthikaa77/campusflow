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
    private final NotificationRepository notificationRepository;
    private final TimetableRepository timetableRepository;

    private static final LocalDate SEM_START = LocalDate.of(2026, 4, 13);
    private static final int SEM_WORKING_DAYS = 90;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository,
                             NotificationRepository notificationRepository,
                             TimetableRepository timetableRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.timetableRepository = timetableRepository;
    }

    // Count working days (Mon-Fri) between two dates inclusive
    private long countWorkingDays(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) return 0;
        long count = 0;
        LocalDate d = from;
        while (!d.isAfter(to)) {
            java.time.DayOfWeek dow = d.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) count++;
            d = d.plusDays(1);
        }
        return Math.min(count, SEM_WORKING_DAYS);
    }

    // How many times a subject appears on a given timetable day within elapsed working days
    private long calcTotalPossible(Long subjectId, long elapsedWorkingDays) {
        List<Timetable> slots = timetableRepository.findBySubject_IdOrderByDayOfWeekAsc(subjectId);
        if (slots.isEmpty()) return 0;
        // Count occurrences per weekday
        Map<Timetable.DayOfWeek, Long> perDay = new HashMap<>();
        for (Timetable t : slots) perDay.merge(t.getDayOfWeek(), 1L, Long::sum);
        // Simulate elapsed working days from SEM_START
        long total = 0;
        LocalDate d = SEM_START;
        long worked = 0;
        while (worked < elapsedWorkingDays) {
            java.time.DayOfWeek dow = d.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                Timetable.DayOfWeek ttDay = Timetable.DayOfWeek.valueOf(dow.name());
                total += perDay.getOrDefault(ttDay, 0L);
                worked++;
            }
            d = d.plusDays(1);
        }
        return total;
    }

    // Total classes for a subject in the full 90-day semester
    private long calcSemesterTotal(Long subjectId) {
        return calcTotalPossible(subjectId, SEM_WORKING_DAYS);
    }

    public List<Map<String, Object>> getMarkSheet(Long subjectId, LocalDate date) {
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        List<Student> students = studentRepository.findByClassroom_ClassId(subject.getClassroom().getClassId());
        List<Attendance> existing = attendanceRepository.findBySubject_IdAndDate(subjectId, date);
        Map<String, Boolean> statusMap = new HashMap<>();
        existing.forEach(a -> statusMap.put(a.getStudent().getRegisterNumber(), a.getIsPresent()));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Student st : students) {
            Map<String, Object> row = new HashMap<>();
            row.put("studentId", st.getRegisterNumber());
            row.put("name", st.getUser() != null ? st.getUser().getName() : st.getRegisterNumber());
            row.put("registerNumber", st.getRegisterNumber());
            row.put("isPresent", statusMap.getOrDefault(st.getRegisterNumber(), null));
            result.add(row);
        }
        return result;
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
            if (student.getUser() != null)
                checkAndNotify(student, subject);
        }
    }

    private void checkAndNotify(Student student, Subject subject) {
        List<Attendance> records = attendanceRepository
            .findByStudent_RegisterNumberAndSubject_Id(student.getRegisterNumber(), subject.getId());
        long attended = records.stream().filter(Attendance::getIsPresent).count();
        long elapsedWorkingDays = countWorkingDays(SEM_START, LocalDate.now());
        long totalPossible = calcTotalPossible(subject.getId(), elapsedWorkingDays);
        if (totalPossible == 0) return;
        double pct = (attended * 100.0) / totalPossible;
        long safeAbsents = (long) Math.floor(attended / 0.75) - totalPossible;
        String courseName = subject.getCourse().getCourseName();
        String title = null; String message = null;
        if (pct < 75) {
            long needed = (long) Math.ceil((0.75 * totalPossible - attended) / 0.25);
            title = "\u26a0 Low Attendance: " + courseName;
            message = String.format("Your attendance in %s is %.1f%% (%d/%d classes held). Attend %d more consecutive class%s to reach 75%%.",
                courseName, pct, attended, totalPossible, needed, needed == 1 ? "" : "es");
        } else if (safeAbsents == 0) {
            title = "\u26a0 Attendance Warning: " + courseName;
            message = String.format("Your attendance in %s is %.1f%% (%d/%d). One more absent will drop you below 75%%!",
                courseName, pct, attended, totalPossible);
        } else if (safeAbsents <= 2) {
            title = "\ud83d\udcca Attendance Alert: " + courseName;
            message = String.format("Your attendance in %s is %.1f%% (%d/%d). Only %d more absent%s allowed before dropping below 75%%.",
                courseName, pct, attended, totalPossible, safeAbsents, safeAbsents == 1 ? "" : "s");
        }
        if (title != null) {
            Notification notif = new Notification();
            notif.setUser(student.getUser());
            notif.setTitle(title);
            notif.setMessage(message);
            notif.setType(Notification.Type.GENERAL);
            notificationRepository.save(notif);
        }
    }

    public List<Attendance> getStudentAttendance(String studentId, Long subjectId) {
        if (subjectId != null)
            return attendanceRepository.findByStudent_RegisterNumberAndSubject_Id(studentId, subjectId);
        return attendanceRepository.findByStudent_RegisterNumber(studentId);
    }

    public List<Map<String, Object>> getAttendanceSummary(String studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        List<Subject> allSubjects = subjectRepository.findByClassroom_ClassId(student.getClassroom().getClassId());
        List<Object[]> raw = attendanceRepository.getAttendanceSummary(studentId);
        Map<Long, Long> attendedMap = new HashMap<>();
        for (Object[] row : raw) {
            Long subjectId = (Long) row[0];
            long attended = ((Number) row[2]).longValue();
            attendedMap.put(subjectId, attended);
        }
        LocalDate today = LocalDate.now();
        long elapsedWorkingDays = countWorkingDays(SEM_START, today);
        long semWorkingDaysLeft = SEM_WORKING_DAYS - elapsedWorkingDays;
        List<Map<String, Object>> result = new ArrayList<>();
        for (Subject sub : allSubjects) {
            long attended = attendedMap.getOrDefault(sub.getId(), 0L);
            long totalPossible = calcTotalPossible(sub.getId(), elapsedWorkingDays);
            long semesterTotal = calcSemesterTotal(sub.getId());
            long remainingClasses = semesterTotal - totalPossible;
            double pct = totalPossible > 0 ? Math.round((attended * 100.0 / totalPossible) * 100.0) / 100.0 : 0;
            // safe absents = floor(attended/0.75) - totalPossible
            long safeAbsents = (long) Math.floor(attended / 0.75) - totalPossible;
            // classes needed to recover if below 75%
            long neededToRecover = pct < 75 ? (long) Math.ceil((0.75 * totalPossible - attended) / 0.25) : 0;
            Map<String, Object> map = new HashMap<>();
            map.put("course_name", sub.getCourse().getCourseName());
            map.put("course_code", sub.getCourse().getCourseCode());
            map.put("staff_name", sub.getStaff().getName());
            map.put("attended", attended);
            map.put("total_possible", totalPossible);
            map.put("semester_total", semesterTotal);
            map.put("remaining_classes", remainingClasses);
            map.put("percentage", pct);
            map.put("safe_absents", safeAbsents);
            map.put("needed_to_recover", neededToRecover);
            map.put("sem_start", SEM_START.toString());
            map.put("elapsed_working_days", elapsedWorkingDays);
            result.add(map);
        }
        return result;
    }

    public List<Attendance> getSubjectAttendance(Long subjectId, LocalDate date) {
        if (date != null)
            return attendanceRepository.findBySubject_IdAndDate(subjectId, date);
        return attendanceRepository.findBySubject_Id(subjectId);
    }
}
