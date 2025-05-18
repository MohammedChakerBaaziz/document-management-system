package com.dms.auth.controller;

import com.dms.auth.dto.DepartmentRequest;
import com.dms.auth.dto.MessageResponse;
import com.dms.auth.model.Department;
import com.dms.auth.repository.DepartmentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Department not found"));
        return ResponseEntity.ok(department);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentRequest departmentRequest) {
        if (departmentRepository.existsByName(departmentRequest.getName())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Department name already exists!"));
        }

        Department department = new Department();
        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        departmentRepository.save(department);
        return ResponseEntity.ok(new MessageResponse("Department created successfully!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequest departmentRequest) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Department not found"));

        // Check if name is taken by another department
        if (!department.getName().equals(departmentRequest.getName()) && 
                departmentRepository.existsByName(departmentRequest.getName())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Department name already exists!"));
        }

        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        departmentRepository.save(department);
        return ResponseEntity.ok(new MessageResponse("Department updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Department not found"));
        }

        departmentRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Department deleted successfully!"));
    }
    
    @GetMapping("/{id}/users")
    public ResponseEntity<?> getDepartmentUsers(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Department not found"));
        
        return ResponseEntity.ok(department.getUsers());
    }
}
