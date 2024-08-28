package org.jiwoo.back.common.OpenAI.service;

import org.jiwoo.back.common.OpenAI.dto.OpenAIRequestDTO;
import org.jiwoo.back.common.OpenAI.dto.OpenAIResponseDTO;
import org.jiwoo.back.common.exception.OpenAIResponseFailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class OpenAIServiceImpl implements OpenAIService {

    private final Map<String, String> openAIEnv = new HashMap<>();

    private final RestTemplate template;

    @Autowired
    public OpenAIServiceImpl(Environment env, @Qualifier("openAITemplate") RestTemplate template) {
        openAIEnv.put("model", env.getProperty("open-ai.model"));
        openAIEnv.put("url", env.getProperty("open-ai.url"));
        this.template = template;
    }

    @Override
    public String generateAnswer(String questionPrompt) throws OpenAIResponseFailException {

        String model = openAIEnv.get("model");
        String apiURL = openAIEnv.get("url");

        OpenAIRequestDTO openAIRequest = new OpenAIRequestDTO(model, questionPrompt);
        OpenAIResponseDTO openAIResponse = template.postForObject(apiURL, openAIRequest, OpenAIResponseDTO.class);

        if (openAIResponse == null) {
            throw new OpenAIResponseFailException();
        }

        return openAIResponse.choices().get(0).message().content();
    }
}
