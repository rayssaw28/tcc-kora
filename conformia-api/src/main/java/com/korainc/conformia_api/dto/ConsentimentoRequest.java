package com.korainc.conformia_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConsentimentoRequest(

        @NotBlank(message = "A versão do termo é obrigatória.")
        @Size(max = 20, message = "A versão do termo deve ter no máximo 20 caracteres.")
        String versaoTermo,

        @NotNull(message = "Informe se o consentimento é concedido (true) ou revogado (false).")
        Boolean aceito
) {
}
