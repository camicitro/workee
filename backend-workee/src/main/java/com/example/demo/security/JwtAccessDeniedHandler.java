package com.example.demo.security;

import java.io.IOException;
import java.io.PrintWriter;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        //response.sendError(HttpServletResponse.SC_FORBIDDEN, "No tiene permisos");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
        response.setContentType("application/json");

        PrintWriter writer = response.getWriter();
        writer.write("{\"error\": \"El usuario no tiene permisos suficientes para acceder a la funcionalidad.\"}");
        writer.flush();
    }
}