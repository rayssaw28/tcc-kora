package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.ConsentimentoResponse;
import com.korainc.conformia_api.dto.TermoLgpdRequest;
import com.korainc.conformia_api.dto.TermoLgpdResponse;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.ConsentimentoService;
import com.korainc.conformia_api.service.EscopoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ConsentimentoController {

    private final ConsentimentoService service;
    private final EscopoService escopoService;

    @PostMapping("/api/funcionarios/me/consentimento")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsentimentoResponse registrar(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            HttpServletRequest http
    ) {
        return service.registrar(usuario.getId(), http.getRemoteAddr());
    }

    @GetMapping("/api/termos/lgpd/atual")
    public TermoLgpdResponse termoAtual() {
        return service.termoAtual();
    }

    @PostMapping("/api/termos/lgpd")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TermoLgpdResponse publicar(@Valid @RequestBody TermoLgpdRequest request) {
        return service.publicar(request);
    }

    @GetMapping("/api/funcionarios/me/consentimento")
    public List<ConsentimentoResponse> meuHistorico(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.historicoDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/consentimento")
    public List<ConsentimentoResponse> historicoDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        escopoService.validarAcesso(usuario, funcionarioId);
        return service.historicoDoFuncionario(funcionarioId);
    }
}
