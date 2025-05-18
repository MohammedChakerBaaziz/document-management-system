package com.dms.document.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    
    private Long id;
    private String title;
    private String translatedTitle;
    private Long categoryId;
    private String categoryName;
    private Long departmentId;
    private String departmentName;
    private String fileKey;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long createdBy;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String downloadUrl;
}
