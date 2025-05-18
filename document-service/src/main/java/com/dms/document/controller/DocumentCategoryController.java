package com.dms.document.controller;

import com.dms.document.dto.DocumentCategoryRequest;
import com.dms.document.model.DocumentCategory;
import com.dms.document.service.DocumentCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentCategoryController {
    
    @Autowired
    private DocumentCategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<DocumentCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DocumentCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @PostMapping
    public ResponseEntity<DocumentCategory> createCategory(@Valid @RequestBody DocumentCategoryRequest categoryRequest) {
        return new ResponseEntity<>(categoryService.createCategory(categoryRequest), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DocumentCategory> updateCategory(
            @PathVariable Long id, 
            @Valid @RequestBody DocumentCategoryRequest categoryRequest) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryRequest));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
