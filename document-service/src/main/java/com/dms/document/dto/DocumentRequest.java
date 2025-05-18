package com.dms.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DocumentRequest {
    
    @NotBlank
    private String title;
    
    @NotNull
    private Long categoryId;
    
    @NotNull
    private Long departmentId;
    
    @NotBlank
    private String fileKey;
    
    private String fileName;
    
    private String fileType;
    
    private Long fileSize;
}
