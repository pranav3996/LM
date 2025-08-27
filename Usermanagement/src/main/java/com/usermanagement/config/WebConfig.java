package com.usermanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect all paths to the index.html
        registry.addViewController("/{spring:[a-zA-Z0-9-]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{spring:[a-zA-Z0-9-]+}/{spring:[a-zA-Z0-9-]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{spring:[a-zA-Z0-9-]+}/{spring:[a-zA-Z0-9-]+}/{spring:[a-zA-Z0-9-]+}")
                .setViewName("forward:/index.html");
    }
}
