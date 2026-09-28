package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.EspelhoPontoRequest;
import com.korainc.conformia_api.dto.EspelhoPontoResponse;
import com.korainc.conformia_api.service.EspelhoPontoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/integracao")
@RequiredArgsConstructor
public class IntegracaoController {

    private final EspelhoPontoService espelhoPontoService;

    @Value("${integracao.api-key}")
    private String apiKeyEsperada;

    @PostMapping("/espelho-ponto")
    public EspelhoPontoResponse receberEspelhoPonto(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @Valid @RequestBody EspelhoPontoRequest request) {

        if (apiKeyEsperada == null || apiKeyEsperada.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Integração de ponto não configurada.");
        }
        if (apiKey == null || !apiKey.equals(apiKeyEsperada)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chave de integração inválida.");
        }
        return espelhoPontoService.receber(request);
    }
}
