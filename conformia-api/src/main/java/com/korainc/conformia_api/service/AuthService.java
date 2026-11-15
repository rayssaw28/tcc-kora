package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.LoginRequest;
import com.korainc.conformia_api.dto.LoginResponse;
import com.korainc.conformia_api.exception.LoginBloqueadoException;
import com.korainc.conformia_api.mapper.FuncionarioMapper;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.security.JwtService;
import com.korainc.conformia_api.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final FuncionarioMapper funcionarioMapper;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse login(LoginRequest request, String ip) {

        String chaveEmail = LoginAttemptService.chaveEmail(request.email());
        String chaveIp = LoginAttemptService.chaveIp(ip);

        long restante = Math.max(
                loginAttemptService.segundosRestantesBloqueio(chaveEmail),
                loginAttemptService.segundosRestantesBloqueio(chaveIp));
        if (restante > 0) {
            throw new LoginBloqueadoException(
                    "Muitas tentativas de login. Tente novamente mais tarde.", restante);
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        } catch (AuthenticationException ex) {
            loginAttemptService.registrarFalha(chaveEmail);
            loginAttemptService.registrarFalha(chaveIp);
            throw ex;
        }

        loginAttemptService.registrarSucesso(chaveEmail);
        loginAttemptService.registrarSucesso(chaveIp);

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
