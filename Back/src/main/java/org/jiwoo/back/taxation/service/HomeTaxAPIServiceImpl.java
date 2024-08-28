package org.jiwoo.back.taxation.service;

import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.business.dto.BusinessDTO;
import org.jiwoo.back.business.service.BusinessService;
import org.jiwoo.back.taxation.dto.TaxationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class HomeTaxAPIServiceImpl implements HomeTaxAPIService {

    @Value("${homeTax.api.url}")
    private String apiUrl;

    @Value("${homeTax.api.serviceKey}")
    private String serviceKey;

    @Value("${homeTax.api.authorization}")
    private String authorization;

    @Autowired
    private BusinessService businessService;

    @Qualifier("defaultTemplate")
    private final RestTemplate restTemplate;

    public HomeTaxAPIServiceImpl(@Qualifier("defaultTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public TaxationDTO getTaxationInfo(int businessId){
        TaxationDTO taxationDTO = new TaxationDTO();
        BusinessDTO businessDTO = new BusinessDTO();

        // 사업 번호로 사업정보 조회
        businessDTO = getBusinessNumber(businessId);
        String businessNumber = businessDTO.getBusinessNumber();
        String businessContent = businessDTO.getBusinessContent();

        // 사업자 등록 번호로 사업자 유형 조회
        String businessType = getBusinessType(businessNumber);


        taxationDTO.setBusinessId(String.valueOf(businessId));
        taxationDTO.setBusinessCode(businessNumber);
        taxationDTO.setBusinessContent(businessContent);
        taxationDTO.setBusinessType(businessType);

        return taxationDTO;
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public BusinessDTO getBusinessNumber(int businessId){
        //사업번호로 사업정보 조회
        BusinessDTO businessDTO = businessService.findBusinessById(businessId);

        return businessDTO;
    }

    @Override
    public String getBusinessType(String businessNumber) {
        // 사업자 등록번호로 사업자 유형 API 조회

        log.info("\n***** 서비스 잘 들어왔어");

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("b_no", new String[]{businessNumber});
        log.info("\n***** 사업자 등록 번호 : " + businessNumber);
        log.info("\n***** requestData : " + requestData.get("b_no"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", authorization);

        log.info("\n***** apiUrl : " + apiUrl);
        log.info("\n***** serviceKey : " + serviceKey);
        log.info("\n***** authorization : " + authorization);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

        try {
            String url = String.format("%s?serviceKey=%s", apiUrl, serviceKey);
            URI uri = new URI(url);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(uri, HttpMethod.POST, entity, Map.class);
            log.info("\n***** api 호출하고 돌아옴");
            Map<String, Object> response = responseEntity.getBody();

            if(response != null && response.containsKey("data")){
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");

                if(!dataList.isEmpty()){
                    Map<String, Object> data = dataList.get(0);
                    return (String) data.get("tax_type");
                }

            }

            return "API로부터 유효한 응답이 없습니다.";

        } catch (HttpClientErrorException e) {

            log.error("API 요청 중 에러 발생: " + e.getMessage());
            return "API 요청 중 에러 발생: " + e.getMessage();

        } catch (Exception e) {

            log.error("기타 에러 발생: " + e.getMessage());
            return "기타 에러 발생: " + e.getMessage();

        }
    }
}
