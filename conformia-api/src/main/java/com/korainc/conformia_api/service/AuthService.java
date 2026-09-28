package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.LoginRequest;
import com.korainc.conformia_api.dto.LoginResponse;
import com.korainc.conformia_api.mapper.FuncionarioMapper;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final FuncionarioMapper funcionarioMapper;

    public LoginResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha()));

        AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs(),
                principal.getFuncionario().isSenhaTemporaria(),
                funcionarioMapper.toResumo(principal.getFuncionario())
        );
    }
}
