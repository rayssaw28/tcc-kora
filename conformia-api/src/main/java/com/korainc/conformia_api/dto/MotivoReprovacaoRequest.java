package com.korainc.conformia_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MotivoReprovacaoRequest(
        @NotBlank(message = "O motivo é obrigatório.")
        @Size(max = 255, message = "O motivo deve ter no máximo 255 caracteres.")
        String motivo
) {
}
