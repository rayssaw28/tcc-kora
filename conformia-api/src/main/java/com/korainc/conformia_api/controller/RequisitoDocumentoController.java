package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.RequisitoDocumentoRequest;
import com.korainc.conformia_api.dto.RequisitoDocumentoResponse;
import com.korainc.conformia_api.service.RequisitoDocumentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisitos-documentos")
@RequiredArgsConstructor
public class RequisitoDocumentoController {

    private final RequisitoDocumentoService service;

    @GetMapping
    public List<RequisitoDocumentoResponse> listar() {
        return service.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public RequisitoDocumentoResponse criar(
            @Valid @RequestBody RequisitoDocumentoRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RequisitoDocumentoResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody RequisitoDocumentoRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
