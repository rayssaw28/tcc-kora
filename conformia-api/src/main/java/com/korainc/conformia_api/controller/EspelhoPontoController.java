package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.EspelhoPontoResponse;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.EscopoService;
import com.korainc.conformia_api.service.EspelhoPontoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EspelhoPontoController {

    private final EspelhoPontoService service;
    private final EscopoService escopoService;

    @GetMapping("/api/funcionarios/me/espelho-ponto")
    public List<EspelhoPontoResponse> meuEspelho(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/espelho-ponto/saldos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EspelhoPontoResponse> saldosNaoZerados() {
        return service.listarSaldosNaoZerados();
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/espelho-ponto")
    public List<EspelhoPontoResponse> espelhoDe(@PathVariable Long funcionarioId,
                                                @AuthenticationPrincipal AuthenticatedUser usuario) {
        escopoService.validarAcesso(usuario, funcionarioId);
        return service.listarDoFuncionario(funcionarioId);
    }
}
