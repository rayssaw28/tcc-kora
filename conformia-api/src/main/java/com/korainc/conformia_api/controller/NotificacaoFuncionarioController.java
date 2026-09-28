package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.NotificacaoFuncionarioResponse;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.NotificacaoFuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NotificacaoFuncionarioController {

    private final NotificacaoFuncionarioService service;

    @GetMapping("/api/funcionarios/me/notificacoes")
    public List<NotificacaoFuncionarioResponse> minhasNotificacoes(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        if (usuario.isAdmin()) {
            return List.of();
        }
        return service.listarDoFuncionario(usuario.getId());
    }
}
