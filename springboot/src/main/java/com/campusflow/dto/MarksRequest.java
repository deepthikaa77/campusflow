package com.campusflow.dto;

import java.math.BigDecimal;
import java.util.List;

public class MarksRequest {
    private String studentId;
    private Long subjectId;
    private Integer examTypeId;
    private BigDecimal marksObtained;
    private List<MarksRecord> records;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Integer getExamTypeId() { return examTypeId; }
    public void setExamTypeId(Integer examTypeId) { this.examTypeId = examTypeId; }

    public BigDecimal getMarksObtained() { return marksObtained; }
    public void setMarksObtained(BigDecimal marksObtained) { this.marksObtained = marksObtained; }

    public List<MarksRecord> getRecords() { return records; }
    public void setRecords(List<MarksRecord> records) { this.records = records; }

    public static class MarksRecord {
        private String studentId;
        private BigDecimal marksObtained;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public BigDecimal getMarksObtained() { return marksObtained; }
        public void setMarksObtained(BigDecimal marksObtained) { this.marksObtained = marksObtained; }
    }
}
