package com.korainc.conformia_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvaliacaoItemRequest(

        @NotBlank(message = "O critério é obrigatório.")
        @Size(max = 120, message = "O critério deve ter no máximo 120 caracteres.")
        String criterio,

        @Min(value = 1, message = "A nota deve estar entre 1 e 5.")
        @Max(value = 5, message = "A nota deve estar entre 1 e 5.")
        int nota,

        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres.")
        String comentario
) {
}
