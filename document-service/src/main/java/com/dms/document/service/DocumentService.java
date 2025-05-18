package com.dms.document.service;

import com.dms.document.dto.DocumentRequest;
import com.dms.document.dto.DocumentResponse;
import com.dms.document.exception.ResourceNotFoundException;
import com.dms.document.model.Document;
import com.dms.document.model.DocumentCategory;
import com.dms.document.repository.DocumentCategoryRepository;
import com.dms.document.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private DocumentCategoryRepository categoryRepository;
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Autowired
    private KafkaTemplate<String, Map<String, Object>> kafkaTemplate;
    
    @Value("${storage.service.url}")
    private String storageServiceUrl;
    
    @Value("${translation.service.url}")
    private String translationServiceUrl;
    
    @Value("${auth.service.url}")
    private String authServiceUrl;
    
    @Value("${kafka.topics.document-created}")
    private String documentCreatedTopic;
    
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        
        return mapToDocumentResponse(document);
    }
    
    public List<DocumentResponse> getDocumentsByDepartment(Long departmentId) {
        return documentRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public List<DocumentResponse> getDocumentsByDepartments(List<Long> departmentIds) {
        return documentRepository.findByDepartmentIds(departmentIds).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public List<DocumentResponse> getDocumentsByCategory(Long categoryId) {
        return documentRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public List<DocumentResponse> getDocumentsByUser(Long userId) {
        return documentRepository.findByCreatedBy(userId).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public List<DocumentResponse> searchDocuments(String searchTerm) {
        return documentRepository.searchDocuments(searchTerm).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    public List<DocumentResponse> searchDocumentsByDepartments(String searchTerm, List<Long> departmentIds) {
        return documentRepository.searchDocumentsByDepartments(searchTerm, departmentIds).stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public DocumentResponse createDocument(DocumentRequest documentRequest, Long userId) {
        // Validate category exists
        DocumentCategory category = categoryRepository.findById(documentRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + documentRequest.getCategoryId()));
        
        // Create document
        Document document = new Document();
        document.setTitle(documentRequest.getTitle());
        document.setCategory(category);
        document.setDepartmentId(documentRequest.getDepartmentId());
        
        // Get department name from auth service
        String departmentName = getDepartmentName(documentRequest.getDepartmentId());
        document.setDepartmentName(departmentName);
        
        document.setFileKey(documentRequest.getFileKey());
        document.setFileName(documentRequest.getFileName());
        document.setFileType(documentRequest.getFileType());
        document.setFileSize(documentRequest.getFileSize());
        document.setCreatedBy(userId);
        document.setCreatedAt(LocalDateTime.now());
        
        Document savedDocument = documentRepository.save(document);
        
        // Send document to translation service via Kafka
        sendDocumentForTranslation(savedDocument);
        
        return mapToDocumentResponse(savedDocument);
    }
    
    @Transactional
    public DocumentResponse updateDocument(Long id, DocumentRequest documentRequest) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        
        // Validate category exists
        DocumentCategory category = categoryRepository.findById(documentRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + documentRequest.getCategoryId()));
        
        document.setTitle(documentRequest.getTitle());
        document.setCategory(category);
        
        // Only update department if it's changed
        if (!document.getDepartmentId().equals(documentRequest.getDepartmentId())) {
            document.setDepartmentId(documentRequest.getDepartmentId());
            String departmentName = getDepartmentName(documentRequest.getDepartmentId());
            document.setDepartmentName(departmentName);
        }
        
        // Only update file info if it's changed
        if (!document.getFileKey().equals(documentRequest.getFileKey())) {
            document.setFileKey(documentRequest.getFileKey());
            document.setFileName(documentRequest.getFileName());
            document.setFileType(documentRequest.getFileType());
            document.setFileSize(documentRequest.getFileSize());
        }
        
        document.setUpdatedAt(LocalDateTime.now());
        
        Document updatedDocument = documentRepository.save(document);
        
        // If title changed, send for translation
        if (!document.getTitle().equals(documentRequest.getTitle())) {
            sendDocumentForTranslation(updatedDocument);
        }
        
        return mapToDocumentResponse(updatedDocument);
    }
    
    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        
        documentRepository.delete(document);
        
        // Call storage service to delete the file
        deleteFileFromStorage(document.getFileKey());
    }
    
    private String getDepartmentName(Long departmentId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(authServiceUrl + "/api/departments/" + departmentId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(response -> (String) response.get("name"))
                    .block();
        } catch (Exception e) {
            return "Unknown Department";
        }
    }
    
    private String getUserName(Long userId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(authServiceUrl + "/api/users/" + userId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(response -> (String) response.get("username"))
                    .block();
        } catch (Exception e) {
            return "Unknown User";
        }
    }
    
    private String getDownloadUrl(String fileKey) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(storageServiceUrl + "/api/storage/download-url/" + fileKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            return null;
        }
    }
    
    private void deleteFileFromStorage(String fileKey) {
        try {
            webClientBuilder.build()
                    .delete()
                    .uri(storageServiceUrl + "/api/storage/files/" + fileKey)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to delete file from storage: " + e.getMessage());
        }
    }
    
    private void sendDocumentForTranslation(Document document) {
        Map<String, Object> message = Map.of(
                "documentId", document.getId(),
                "title", document.getTitle()
        );
        
        kafkaTemplate.send(documentCreatedTopic, message);
    }
    
    private DocumentResponse mapToDocumentResponse(Document document) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setTitle(document.getTitle());
        response.setTranslatedTitle(document.getTranslatedTitle());
        response.setCategoryId(document.getCategory().getId());
        response.setCategoryName(document.getCategory().getName());
        response.setDepartmentId(document.getDepartmentId());
        response.setDepartmentName(document.getDepartmentName());
        response.setFileKey(document.getFileKey());
        response.setFileName(document.getFileName());
        response.setFileType(document.getFileType());
        response.setFileSize(document.getFileSize());
        response.setCreatedBy(document.getCreatedBy());
        response.setCreatedByUsername(getUserName(document.getCreatedBy()));
        response.setCreatedAt(document.getCreatedAt());
        response.setUpdatedAt(document.getUpdatedAt());
        response.setDownloadUrl(getDownloadUrl(document.getFileKey()));
        
        return response;
    }
}
