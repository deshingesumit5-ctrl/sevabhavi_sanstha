package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.dto.*;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MarriageRegistrationService {
    // Existing methods
    MarriageRegistration registerMarriage(MarriageRegistration registration);
    List<MarriageRegistration> getAllRegistrations();
    MarriageRegistration updateApprovalStatus(Integer id, String status);
    MarriageRegistration updateApprovalStatusWithReason(Integer id, String status, String reason);
    MarriageRegistration getById(Integer id);
    byte[] generateFormPdf(Integer id);

    // Matrimony Public & Member Profiles
    Page<MatrimonyPublicProfileDTO> getPublicProfiles(MatrimonyFilterDTO filter, Pageable pageable, Integer currentUserId);
    MatrimonyPublicProfileDTO getPublicProfileById(Integer id, Integer currentUserId);
    MatrimonyFullProfileDTO getFullProfileById(Integer id, Integer currentUserId, boolean isAdmin);
    List<MatrimonyPublicProfileDTO> getSimilarProfiles(Integer profileId, Pageable pageable, Integer currentUserId);

    // Matrimony Auth
    MatrimonyAuthResponseDTO loginMatrimonyUser(String identifier, String password);
    void resetMatrimonyPassword(String identifier, String newPassword);

    // Favourites
    boolean toggleFavorite(Integer userId, Integer profileId);
    List<Integer> getUserFavorites(Integer userId);

    // Photo upload
    String uploadPhoto(MultipartFile file) throws Exception;
}
