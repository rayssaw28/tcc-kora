package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.LoginRequest;
import com.korainc.conformia_api.dto.LoginResponse;
import com.korainc.conformia_api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, extrairIp(httpRequest)));
    }

    /**
     * Usa o primeiro IP de X-Forwarded-For (quando presente) ou o remoteAddr.
     * O cabeçalho só é confiável se a API estiver atrás de um proxy que o sobrescreva.
     */
    private String extrairIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String primeiro = forwarded.split(",")[0].trim();
            if (!primeiro.isEmpty()) {
                return primeiro;
            }
        }
        return request.getRemoteAddr();
    }
}
