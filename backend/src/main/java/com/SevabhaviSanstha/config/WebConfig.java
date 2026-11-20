package com.SevabhaviSanstha.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path configuredDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path uploadsRoot = configuredDir.getParent() != null ? configuredDir.getParent() : configuredDir;
        String configuredRootUri = uploadsRoot.toUri().toString();
        if (!configuredRootUri.endsWith("/")) {
            configuredRootUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        configuredRootUri,
                        "file:uploads/",
                        "file:backend/uploads/"
                );
    }
}
