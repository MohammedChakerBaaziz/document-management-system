package com.dms.auth.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class UserDepartmentRequest {
    @NotNull
    private Long userId;
    
    @NotEmpty
    private Set<Long> departmentIds;
}
