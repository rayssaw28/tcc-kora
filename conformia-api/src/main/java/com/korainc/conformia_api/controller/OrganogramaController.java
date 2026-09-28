package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.OrganogramaNode;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.EscopoService;
import com.korainc.conformia_api.service.OrganogramaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organograma")
@RequiredArgsConstructor
public class OrganogramaController {

    private final OrganogramaService service;
    private final EscopoService escopoService;

    @GetMapping
    public List<OrganogramaNode> completo() {
        return service.completo();
    }

    @GetMapping("/me")
    public OrganogramaNode minhaEquipe(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.subarvore(usuario.getId());
    }

    @GetMapping("/{funcionarioId}")
    public OrganogramaNode subarvore(@PathVariable Long funcionarioId,
                                     @AuthenticationPrincipal AuthenticatedUser usuario) {
        escopoService.validarAcesso(usuario, funcionarioId);
        return service.subarvore(funcionarioId);
    }
}
