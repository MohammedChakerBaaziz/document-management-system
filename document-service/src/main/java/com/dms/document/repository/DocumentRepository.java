package com.dms.document.repository;

import com.dms.document.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByDepartmentId(Long departmentId);
    
    @Query("SELECT d FROM Document d WHERE d.departmentId IN :departmentIds")
    List<Document> findByDepartmentIds(@Param("departmentIds") List<Long> departmentIds);
    
    List<Document> findByCategoryId(Long categoryId);
    
    List<Document> findByCreatedBy(Long userId);
    
    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.translatedTitle) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Document> searchDocuments(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT d FROM Document d WHERE " +
           "d.departmentId IN :departmentIds AND " +
           "(LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.translatedTitle) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Document> searchDocumentsByDepartments(
            @Param("searchTerm") String searchTerm,
            @Param("departmentIds") List<Long> departmentIds);
}
