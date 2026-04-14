package com.campusflow.service;

import com.campusflow.dto.MarksRequest;
import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MarksService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamTypeRepository examTypeRepository;
    private final UserRepository userRepository;

    public MarksService(MarksRepository marksRepository, StudentRepository studentRepository,
                        SubjectRepository subjectRepository, ExamTypeRepository examTypeRepository,
                        UserRepository userRepository) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.examTypeRepository = examTypeRepository;
        this.userRepository = userRepository;
    }

    public void saveMarks(String studentId, Long subjectId, Integer examTypeId, BigDecimal marksObtained, User enteredBy) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RuntimeException("Subject not found"));
        ExamType examType = examTypeRepository.findById(examTypeId).orElseThrow(() -> new RuntimeException("Exam type not found"));
        Marks marks = marksRepository
            .findByStudent_RegisterNumberAndSubject_IdAndExamType_Id(studentId, subjectId, examTypeId)
            .orElse(new Marks());
        marks.setStudent(student);
        marks.setSubject(subject);
        marks.setExamType(examType);
        marks.setMarksObtained(marksObtained);
        marks.setMaxMarks(examType.getMaxMarks());
        marks.setEnteredBy(enteredBy);
        marksRepository.save(marks);
    }

    public void saveBulkMarks(MarksRequest req, User enteredBy) {
        // Verify the user is assigned to this subject
        subjectRepository.findById(req.getSubjectId()).ifPresent(subject -> {
            if (!subject.getStaff().getUser().getId().equals(enteredBy.getId()))
                throw new RuntimeException("You are not assigned to teach this subject");
        });
        req.getRecords().forEach(r -> saveMarks(r.getStudentId(), req.getSubjectId(), req.getExamTypeId(), r.getMarksObtained(), enteredBy));
    }

    public List<Map<String, Object>> getStudentMarks(String studentId) {
        return marksRepository.findByStudent_RegisterNumber(studentId)
            .stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getSubjectMarks(Long subjectId, Integer examTypeId) {
        List<Marks> list = examTypeId != null
            ? marksRepository.findBySubject_IdAndExamType_Id(subjectId, examTypeId)
            : marksRepository.findBySubject_Id(subjectId);
        return list.stream().map(this::toMap).toList();
    }

    public List<ExamType> getExamTypes() {
        return examTypeRepository.findAll();
    }

    private Map<String, Object> toMap(Marks m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("studentId", m.getStudent().getRegisterNumber());
        map.put("studentName", m.getStudent().getName());
        map.put("subjectId", m.getSubject().getId());
        map.put("course_name", m.getSubject().getCourse().getCourseName());
        map.put("course_code", m.getSubject().getCourse().getCourseCode());
        map.put("examTypeId", m.getExamType().getId());
        map.put("exam_name", m.getExamType().getName());
        map.put("marks_obtained", m.getMarksObtained());
        map.put("exam_max_marks", m.getMaxMarks());
        map.put("marksObtained", m.getMarksObtained());
        map.put("maxMarks", m.getMaxMarks());
        map.put("createdAt", m.getCreatedAt());
        return map;
    }
}
