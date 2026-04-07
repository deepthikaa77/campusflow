package com.campusflow.dto;

public class ComplaintRequest {
    private String title;
    private String description;
    private String aboutStudentId;
    private String classId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAboutStudentId() { return aboutStudentId; }
    public void setAboutStudentId(String aboutStudentId) { this.aboutStudentId = aboutStudentId; }
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
}
