package com.korainc.conformia_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record FormacoesAcademicasRequest(
        @NotEmpty(message = "Informe ao menos uma formacao academica.")
        List<@Valid FormacaoAcademicaItemRequest> formacoes
) {
}
