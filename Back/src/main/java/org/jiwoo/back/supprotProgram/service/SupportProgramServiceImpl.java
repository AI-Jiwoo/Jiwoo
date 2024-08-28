package org.jiwoo.back.supprotProgram.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.business.service.BusinessService;
import org.jiwoo.back.common.exception.NotLoggedInException;
import org.jiwoo.back.supprotProgram.aggregate.dto.SupportProgramDTO;
import org.jiwoo.back.supprotProgram.aggregate.entity.SupportProgram;
import org.jiwoo.back.supprotProgram.aggregate.entity.SupportProgramBusiness;
import org.jiwoo.back.supprotProgram.repository.SupportProgramBusinessRepository;
import org.jiwoo.back.supprotProgram.repository.SupportProgramRepository;
import org.jiwoo.back.user.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SupportProgramServiceImpl implements SupportProgramService {

    private final SupportProgramRepository supportProgramRepository;
    private final SupportProgramBusinessRepository supportProgramBusinessRepository;
    private final BusinessService businessService;
    private final AuthService authService;
    private final RestTemplate restTemplate;

    @Value("${python.server.url.support}")
    private String pythonSupportUrl;

    @Autowired
    public SupportProgramServiceImpl(SupportProgramRepository supportProgramRepository,
                                     SupportProgramBusinessRepository supportProgramBusinessRepository,
                                     BusinessService businessService, AuthService authService,
                                     @Qualifier("defaultTemplate") RestTemplate restTemplate) {
        this.supportProgramRepository = supportProgramRepository;
        this.supportProgramBusinessRepository = supportProgramBusinessRepository;
        this.businessService = businessService;
        this.authService = authService;
        this.restTemplate = restTemplate;
    }


    @Override
    public void insertSupportProgram(List<SupportProgramDTO> supportProgramDTO) {

        for (SupportProgramDTO program : supportProgramDTO) {

            try {

                SupportProgram supportProgram = supportProgramRepository.save(dtoToEntity(program));
                int supportProgramId = supportProgram.getId();
                List<String> similarBusinessesName = findSimilarBusinesses(program);

                for (String businessName : similarBusinessesName) {

                    int businessId;

                    // 해당 기업이 RDBMS에서 찾을 수 없는 경우
                    try {
                        businessId = businessService.findBusinessByName(businessName).getId();
                    } catch (Exception e) {
                        log.error("[Error]Can Not Find BusinessId: {}", e.getMessage());
                        log.warn("BusinessName: {}", businessName);
                        continue;
                    }
                    if (businessId == 0) {
                        log.warn("[Error]Can Not Find Business: {}", businessName);
                        continue;
                    }

                    supportProgramBusinessRepository.save(SupportProgramBusiness.builder()
                            .supportProgramId(supportProgramId)
                            .businessId(businessId)
                            .build());
                }
            } catch (Exception e) {
                log.error("[Error]SupportProgram Insert: {}", e.getMessage());
            }
        }
    }

    @Override
    public List<SupportProgramDTO> recommendSupportProgram() {

        List<SupportProgramDTO> response = new ArrayList<>();

        try {

            // 현재 로그인 한 유저 이메일
            String email = authService.getCurrentUser().getEmail();

            List<BusinessDTO> businessList = businessService.findAllBusinessesByUser(email);
            List<Integer> supportProgramIds = new ArrayList<>();

            for (BusinessDTO business : businessList) {

                List<SupportProgramBusiness> supportProgramBusinessList = supportProgramBusinessRepository.findByBusinessId(business.getId());

                for (SupportProgramBusiness supportProgramBusiness : supportProgramBusinessList) {
                    supportProgramIds.add(supportProgramBusiness.getSupportProgramId());
                }
            }

            // 중복 제거
            supportProgramIds = supportProgramIds.stream()
                    .distinct()
                    .collect(Collectors.toList());

            for (Integer supportProgramId : supportProgramIds) {
                response.add(entityToDto(supportProgramRepository.findById((int) supportProgramId)));
            }

        } catch (NotLoggedInException e) {
            log.error("[Error]Recommend SupportProgram: {}",e.getMessage());
        }

        return response;
    }


    private SupportProgramDTO entityToDto(SupportProgram supportProgram) {
        return SupportProgramDTO.builder()
                .id(supportProgram.getId())
                .name(supportProgram.getName())
                .target(supportProgram.getTarget())
                .scareOfSupport(supportProgram.getScareOfSupport())
                .supportContent(supportProgram.getSupportContent())
                .supportCharacteristics(supportProgram.getSupportCharacteristics())
                .supportInfo(supportProgram.getSupportInfo())
                .supportYear(supportProgram.getSupportYear())
                .originUrl(supportProgram.getOriginUrl())
                .build();
    }


    private SupportProgram dtoToEntity(SupportProgramDTO dto) {

        return SupportProgram.builder()
                .name(dto.getName())
                .target(dto.getTarget())
                .scareOfSupport(dto.getScareOfSupport())
                .supportContent(dto.getSupportContent())
                .supportCharacteristics(dto.getSupportCharacteristics())
                .supportInfo(dto.getSupportInfo())
                .supportYear(dto.getSupportYear())
                .originUrl(dto.getOriginUrl())
                .build();
    }


    private List<String> findSimilarBusinesses(SupportProgramDTO supportProgramDTO) {

        List<String> businessNames = new ArrayList<>();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestMap = new HashMap<>();
            Map<String, Object> queryMap = new HashMap<>();

            queryMap.put("name", supportProgramDTO.getName());
            queryMap.put("target", supportProgramDTO.getTarget());
            queryMap.put("scare_of_support", supportProgramDTO.getScareOfSupport());
            queryMap.put("support_content", supportProgramDTO.getSupportContent());
            queryMap.put("support_characteristics", supportProgramDTO.getSupportCharacteristics());
            queryMap.put("support_info", supportProgramDTO.getSupportInfo());
            queryMap.put("support_year", supportProgramDTO.getSupportYear());

            requestMap.put("query", queryMap);
            requestMap.put("k", 10);  // 유사한 결과의 수
            requestMap.put("threshold", 0.7);  // 유사도 임계값

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestMap, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    pythonSupportUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {

                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode responseJson = objectMapper.readTree(response.getBody());

                for (JsonNode resultNode : responseJson) {
                    String businessName = resultNode.path("content").path("businessName").asText();
                    businessNames.add(businessName);
                }
                log.info("Successfully retrieved similar businesses: {}", businessNames);
            } else {
                log.warn("Unexpected response from Python server: {}", response.getBody());
            }
        } catch (Exception e) {
            log.error("Failed to retrieve similar businesses: {}", e.getMessage());
        }
        return businessNames;
    }
}
