package com.usermanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{p1:[a-zA-Z0-9-]+}").setViewName("forward:/index.html");
        registry.addViewController("/{p1:[a-zA-Z0-9-]+}/{p2:[a-zA-Z0-9-]+}").setViewName("forward:/index.html");
        registry.addViewController("/{p1:[a-zA-Z0-9-]+}/{p2:[a-zA-Z0-9-]+}/{p3:[a-zA-Z0-9-]+}")
                .setViewName("forward:/index.html");
    }
}
