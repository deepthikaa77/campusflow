package com.campusflow.dto;

import java.time.LocalDate;
import java.util.List;

public class AttendanceRequest {
    private List<AttendanceRecord> records;
    private Long subjectId;
    private LocalDate date;
    private Integer classHour;

    public List<AttendanceRecord> getRecords() { return records; }
    public void setRecords(List<AttendanceRecord> records) { this.records = records; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getClassHour() { return classHour; }
    public void setClassHour(Integer classHour) { this.classHour = classHour; }

    public static class AttendanceRecord {
        private String studentId;
        private Boolean isPresent;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public Boolean getIsPresent() { return isPresent; }
        public void setIsPresent(Boolean isPresent) { this.isPresent = isPresent; }
    }
}
