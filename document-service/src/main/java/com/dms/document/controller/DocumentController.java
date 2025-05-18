package com.dms.document.controller;

import com.dms.document.dto.DocumentRequest;
import com.dms.document.dto.DocumentResponse;
import com.dms.document.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }
    
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(documentService.getDocumentsByDepartment(departmentId));
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByDepartments(@RequestParam List<Long> departmentIds) {
        return ResponseEntity.ok(documentService.getDocumentsByDepartments(departmentIds));
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(documentService.getDocumentsByCategory(categoryId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(userId));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> searchDocuments(@RequestParam String query) {
        return ResponseEntity.ok(documentService.searchDocuments(query));
    }
    
    @GetMapping("/search/departments")
    public ResponseEntity<List<DocumentResponse>> searchDocumentsByDepartments(
            @RequestParam String query,
            @RequestParam List<Long> departmentIds) {
        return ResponseEntity.ok(documentService.searchDocumentsByDepartments(query, departmentIds));
    }
    
    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(
            @Valid @RequestBody DocumentRequest documentRequest,
            @RequestHeader("X-User-ID") Long userId) {
        return new ResponseEntity<>(documentService.createDocument(documentRequest, userId), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentRequest documentRequest) {
        return ResponseEntity.ok(documentService.updateDocument(id, documentRequest));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
