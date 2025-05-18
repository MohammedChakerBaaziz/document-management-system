package com.dms.document.service;

import com.dms.document.dto.DocumentCategoryRequest;
import com.dms.document.exception.ResourceNotFoundException;
import com.dms.document.model.DocumentCategory;
import com.dms.document.repository.DocumentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentCategoryService {
    
    @Autowired
    private DocumentCategoryRepository categoryRepository;
    
    public List<DocumentCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public DocumentCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
    
    @Transactional
    public DocumentCategory createCategory(DocumentCategoryRequest categoryRequest) {
        // Check if category with same name already exists
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new IllegalArgumentException("Category with name " + categoryRequest.getName() + " already exists");
        }
        
        DocumentCategory category = new DocumentCategory();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        
        return categoryRepository.save(category);
    }
    
    @Transactional
    public DocumentCategory updateCategory(Long id, DocumentCategoryRequest categoryRequest) {
        DocumentCategory category = getCategoryById(id);
        
        // Check if name is being changed and if new name is already taken
        if (!category.getName().equals(categoryRequest.getName()) && 
                categoryRepository.existsByName(categoryRequest.getName())) {
            throw new IllegalArgumentException("Category with name " + categoryRequest.getName() + " already exists");
        }
        
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        
        return categoryRepository.save(category);
    }
    
    @Transactional
    public void deleteCategory(Long id) {
        DocumentCategory category = getCategoryById(id);
        
        // Check if category has documents
        if (!category.getDocuments().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete category with associated documents");
        }
        
        categoryRepository.delete(category);
    }
}
