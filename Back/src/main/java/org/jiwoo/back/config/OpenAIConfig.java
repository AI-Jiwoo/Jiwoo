package org.jiwoo.back.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAIConfig {

    private final Environment env;

    @Autowired
    public OpenAIConfig(Environment env) {
        this.env = env;
    }

    @Bean
    @Qualifier("openAITemplate")
    public RestTemplate openAITemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("Authorization", "Bearer " + env.getProperty("open-ai.api-key"));
            return execution.execute(request, body);
        });

        return restTemplate;
    }
}
