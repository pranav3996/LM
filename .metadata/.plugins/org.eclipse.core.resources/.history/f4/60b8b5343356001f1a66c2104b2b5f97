package com.usermanagement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.usermanagement.jwt.AuthEntryPointJwt;
import com.usermanagement.jwt.AuthTokenFilter;
import com.usermanagement.service.OurUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private OurUserDetailsService ourUserDetailsService;
    @Autowired
    private AuthTokenFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(request -> request
//            	.requestMatchers("/auth/**", "/public/**","/password-reset-request/**","/reset-password/**","/user/**","/password-reset-otp-request/**","/verify-otp/**","/regenerate-otp/**","/reset-password-otp/**").permitAll()
            	.requestMatchers("/auth/**", "/public/**","/reset/**","/user/**").permitAll() 
            	.requestMatchers("/admin/**").hasAuthority("ADMIN")
                .requestMatchers("/user/**").hasAuthority("USER")
                .requestMatchers("/adminuser/**","/reset/change-password").hasAnyAuthority("ADMIN", "USER")
                .anyRequest().authenticated())
            .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider()).addFilterBefore(
                jwtAuthFilter, UsernamePasswordAuthenticationFilter.class
            );
        return httpSecurity.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(ourUserDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   
}
