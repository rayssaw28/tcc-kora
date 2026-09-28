package com.korainc.conformia_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TermoLgpdRequest(
        @NotBlank(message = "A versão é obrigatória.")
        @Size(max = 20, message = "A versão deve ter no máximo 20 caracteres.")
        String versao,

        @NotBlank(message = "A URL é obrigatória.")
        @Size(max = 500, message = "A URL deve ter no máximo 500 caracteres.")
        String url
) {
}
