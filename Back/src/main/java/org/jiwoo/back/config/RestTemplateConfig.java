package org.jiwoo.back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
public class RestTemplateConfig {
    @Bean
    @Qualifier("defaultTemplate")
    public RestTemplate defaultTemplate() {
        return new RestTemplate();
    }

}