package com.korainc.conformia_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FeedbackRequest(

        @NotNull(message = "O destinatário é obrigatório.")
        Long destinatarioId,

        @NotBlank(message = "O periodo e obrigatorio.")
        @Size(max = 20, message = "O periodo deve ter no maximo 20 caracteres.")
        String periodo,

        @NotBlank(message = "O feedback é obrigatório.")
        @Size(max = 1000, message = "O feedback deve ter no máximo 1000 caracteres.")
        String comentario,

        @Valid
        List<AvaliacaoItemRequest> criterios
) {
}
