package org.jiwoo.back.common;

import org.jiwoo.back.common.OpenAI.service.OpenAIService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OpenAIServiceTest {

    @Autowired
    private OpenAIService openAIService;

    @DisplayName("OpenAI API 작동 테스트")
    @Test
    void generateAnswer() {

        // given
        String prompt = "연결 확인을 위한 문장입니다.";

        // when, then
//        assertDoesNotThrow(() -> openAIService.generateAnswer(prompt));
    }
}