package org.jiwoo.back.taxaxtion.service;

import org.jiwoo.back.taxation.service.HomeTaxAPIServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestPropertySource(properties = {
        "homeTax.api.url=https://api.odcloud.kr/api/nts-businessman/v1/status",
        "homeTax.api.serviceKey=kvgT%2B316qbwLqJX%2BTsbj7RYPfTFsRdBeGaG1k%2FDNvE8S2Tmf3JhNWUeLlLqgK9wBqpDjwIEULkkJCZCxa292hQ%3D%3D",
        "homeTax.api.authorization=kvgT+316qbwLqJX+Tsbj7RYPfTFsRdBeGaG1k/DNvE8S2Tmf3JhNWUeLlLqgK9wBqpDjwIEULkkJCZCxa292hQ=="
})
public class HomeTaxAPIServiceTest {

    @Autowired
    private HomeTaxAPIServiceImpl homeTaxService;

    @Autowired
    @Qualifier("defaultTemplate")
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this);
    }

    @DisplayName("HomeTax API 로 사업자 유형 조회 테스트")
    @Test
    void testGetBusinessType(){
        //given
        String businessCode = "7873000900";

        //when
        String actualResponse = homeTaxService.getBusinessType(businessCode);

        //then
        assertNotNull(actualResponse);
        System.out.println("API Response : " + actualResponse);
    }
}
