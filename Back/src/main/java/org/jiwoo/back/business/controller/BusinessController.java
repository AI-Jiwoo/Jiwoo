package org.jiwoo.back.business.controller;

import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.business.aggregate.entity.StartupStage;
import org.jiwoo.back.business.aggregate.vo.ResponseBusinessVO;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.business.repository.StartupStageRepository;
import org.jiwoo.back.business.service.BusinessService;
import org.jiwoo.back.user.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/business")
@Slf4j
public class BusinessController {
    private final BusinessService businessService;
    private final StartupStageRepository startupStageRepository;

    @Autowired
    public BusinessController(BusinessService businessService, StartupStageRepository startupStageRepository) {
        this.businessService = businessService;
        this.startupStageRepository = startupStageRepository;
    }

    /* 설명. 사업 정보 조회 */
    @GetMapping("/id/{id}")
    public ResponseEntity<ResponseBusinessVO> getBusinessById(@PathVariable("id") int id) {
        BusinessDTO business = businessService.findBusinessById(id);
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseBusinessVO("조회 성공", List.of(business)));
    }

    /* 설명. 사업 정보 저장 */
    @PostMapping("/regist")
    public ResponseEntity<ResponseBusinessVO> createBusiness(@RequestBody BusinessDTO businessDTO) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userEmail = userDetails.getUsername();

        try {
            // 입력값 검증
            if (businessDTO.getBusinessName() == null || businessDTO.getBusinessName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseBusinessVO("사업체 이름은 필수 입력 항목입니다.", null));
            }

            // 사업자 등록번호 형식 검증 (예: 000-00-00000)
            if (!businessDTO.getBusinessNumber().matches("\\d{3}-\\d{2}-\\d{5}")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseBusinessVO("올바른 사업자 등록번호 형식이 아닙니다.", null));
            }

            // 카테고리 ID 검증
            if (businessDTO.getCategoryIds() == null || businessDTO.getCategoryIds().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseBusinessVO("최소 하나의 카테고리를 선택해야 합니다.", null));
            }

            BusinessDTO savedBusiness = businessService.saveBusiness(businessDTO, userEmail);

            // 저장 성공 로그
            log.info("사업 정보 저장 성공: 사용자 - {}, 사업체명 - {}", userEmail, savedBusiness.getBusinessName());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseBusinessVO("사업 정보 저장 성공", List.of(savedBusiness)));
        } catch (Exception e) {
            // 에러 로그
            log.error("사업 정보 저장 실패: 사용자 - {}, 에러 - {}", userEmail, e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseBusinessVO("사업 정보 저장 실패: " + e.getMessage(), null));
        }
    }

    /* 설명. 사용자 정보로 사업 조회 */
    @GetMapping("/user")
    public ResponseEntity<ResponseBusinessVO> getBusinessesByUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userEmail = userDetails.getUsername();
        List<BusinessDTO> businesses = businessService.findAllBusinessesByUser(userEmail);
        return ResponseEntity.ok(new ResponseBusinessVO("사용자의 모든 사업자 정보 조회 성공", businesses));
    }

    /* 설명. 스타트업 과정 조회 */
    @GetMapping("/startup-stages")
    public ResponseEntity<?> getAllStartupStages() {
        List<StartupStage> stages = startupStageRepository.findAll();
        log.info("Available startup stages: {}", stages);
        return ResponseEntity.ok(stages);
    }

    /* 설명. 현재 사용자의 비즈니스 프로필 조회 */
    @GetMapping("/profile")
    public ResponseEntity<ResponseBusinessVO> getCurrentUserBusinessProfile() {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            BusinessDTO businessProfile = businessService.getCurrentUserBusinessProfile(userDetails.getUsername());
            return ResponseEntity.ok(new ResponseBusinessVO("사용자 비즈니스 프로필 조회 성공", List.of(businessProfile)));
        } catch (Exception e) {
            log.error("사용자 비즈니스 프로필 조회 실패: 에러 - {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ResponseBusinessVO("사용자 비즈니스 프로필 조회 실패: " + e.getMessage(), null));
        }
    }
}