package com.campusflow.controller;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AIPredictionController {

    private final ChatClient chatClient;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;
    private final ClassroomRepository classroomRepository;

    public AIPredictionController(ChatClient.Builder builder,
                                   StaffRepository staffRepository,
                                   StudentRepository studentRepository,
                                   SubjectRepository subjectRepository,
                                   MarksRepository marksRepository,
                                   AttendanceRepository attendanceRepository,
                                   ClassroomRepository classroomRepository) {
        this.chatClient = builder.build();
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.marksRepository = marksRepository;
        this.attendanceRepository = attendanceRepository;
        this.classroomRepository = classroomRepository;
    }

    // TUTOR: all subjects in their class
    @GetMapping("/tutor")
    public ResponseEntity<Map<String, String>> tutorPrediction(@AuthenticationPrincipal User user) {
        Staff staff = staffRepository.findByUser(user).orElseThrow();
        Classroom classroom = classroomRepository.findByTutor(staff).orElseThrow();
        List<Subject> subjects = subjectRepository.findByClassroom_ClassId(classroom.getClassId());
        Map<String, String> result = new LinkedHashMap<>();
        for (Subject subject : subjects) result.put(subject.getCourse().getCourseName(), analyzeSubject(subject));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/staff")
    public ResponseEntity<Map<String, String>> staffPrediction(@AuthenticationPrincipal User user) {
        Staff staff = staffRepository.findByUser(user).orElseThrow();
        List<Subject> subjects = subjectRepository.findByStaff_StaffId(staff.getStaffId());
        Map<String, String> result = new LinkedHashMap<>();
        for (Subject subject : subjects) result.put(subject.getCourse().getCourseName(), analyzeSubject(subject));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student")
    public ResponseEntity<Map<String, String>> studentPrediction(@AuthenticationPrincipal User user) {
        Student student = studentRepository.findByUser(user).orElseThrow();
        List<Subject> subjects = subjectRepository.findByClassroom_ClassId(student.getClassroom().getClassId());
        Map<String, String> result = new LinkedHashMap<>();
        for (Subject subject : subjects) result.put(subject.getCourse().getCourseName(), analyzeStudentSubject(student, subject));
        return ResponseEntity.ok(result);
    }

    private String analyzeSubject(Subject subject) {
        List<Marks> marksList = marksRepository.findBySubject_Id(subject.getId());
        List<Attendance> attendanceList = attendanceRepository.findBySubject_Id(subject.getId());

        Map<String, List<Marks>> marksByStudent = marksList.stream()
            .collect(Collectors.groupingBy(m -> m.getStudent().getRegisterNumber()));
        Map<String, List<Attendance>> attByStudent = attendanceList.stream()
            .collect(Collectors.groupingBy(a -> a.getStudent().getRegisterNumber()));

        StringBuilder sb = new StringBuilder();
        sb.append("Subject: ").append(subject.getCourse().getCourseName()).append("\n");
        sb.append("Class: ").append(subject.getClassroom().getClassName()).append("\n\n");

        Set<String> allStudents = new HashSet<>();
        allStudents.addAll(marksByStudent.keySet());
        allStudents.addAll(attByStudent.keySet());

        for (String regNum : allStudents) {
            sb.append("Student ").append(regNum).append(": ");
            List<Marks> sm = marksByStudent.getOrDefault(regNum, List.of());
            sm.forEach(m -> sb.append(m.getExamType().getName())
                .append("=").append(m.getMarksObtained()).append("/").append(m.getMaxMarks()).append(" "));
            List<Attendance> sa = attByStudent.getOrDefault(regNum, List.of());
            if (!sa.isEmpty()) {
                long present = sa.stream().filter(Attendance::getIsPresent).count();
                sb.append("Attendance=").append(present).append("/").append(sa.size());
            }
            sb.append("\n");
        }

        String prompt = "You are an academic analyst. Based on the following student data for a subject, " +
            "provide a concise analysis (3-5 sentences) covering: overall class performance, students at risk, " +
            "attendance concerns, and recommendations for the teacher. Be specific and use student IDs.\n\n" + sb;

        return chatClient.prompt(prompt).call().content();
    }

    private String analyzeStudentSubject(Student student, Subject subject) {
        List<Marks> marks = marksRepository
            .findByStudent_RegisterNumberAndSubject_Id(student.getRegisterNumber(), subject.getId());
        List<Attendance> attendance = attendanceRepository
            .findByStudent_RegisterNumberAndSubject_Id(student.getRegisterNumber(), subject.getId());

        StringBuilder sb = new StringBuilder();
        sb.append("Student: ").append(student.getName())
          .append(" (").append(student.getRegisterNumber()).append(")\n");
        sb.append("Subject: ").append(subject.getCourse().getCourseName()).append("\n");

        if (!marks.isEmpty()) {
            sb.append("Marks: ");
            marks.forEach(m -> sb.append(m.getExamType().getName())
                .append("=").append(m.getMarksObtained()).append("/").append(m.getMaxMarks()).append(" "));
            sb.append("\n");
        } else {
            sb.append("Marks: Not yet entered\n");
        }

        if (!attendance.isEmpty()) {
            long present = attendance.stream().filter(Attendance::getIsPresent).count();
            sb.append("Attendance: ").append(present).append("/").append(attendance.size())
              .append(" (").append(String.format("%.1f", (present * 100.0 / attendance.size()))).append("%)\n");
        } else {
            sb.append("Attendance: No records yet\n");
        }

        String prompt = "You are an academic advisor. Based on the following student data, " +
            "provide a personalized analysis (3-4 sentences) covering: current performance, " +
            "attendance status, risk level (Low/Medium/High), and specific advice for improvement. " +
            "Be encouraging but honest.\n\n" + sb;

        return chatClient.prompt(prompt).call().content();
    }
}
