package com.korainc.conformia_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AvaliacaoUpdateRequest(

        @NotBlank(message = "O periodo e obrigatorio.")
        @Size(max = 20, message = "O periodo deve ter no maximo 20 caracteres.")
        String periodo,

        @Size(max = 1000, message = "O comentario deve ter no maximo 1000 caracteres.")
        String comentarioGeral,

        @Valid
        List<AvaliacaoItemRequest> itens
) {
}
