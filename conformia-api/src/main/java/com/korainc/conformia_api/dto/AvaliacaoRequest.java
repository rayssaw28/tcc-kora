package com.korainc.conformia_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AvaliacaoRequest(

        @NotNull(message = "avaliadoId é obrigatório.")
        Long avaliadoId,

        @NotBlank(message = "O período é obrigatório.")
        @Size(max = 20, message = "O período deve ter no máximo 20 caracteres.")
        String periodo,

        @Size(max = 1000, message = "O comentário geral deve ter no máximo 1000 caracteres.")
        String comentarioGeral,

        @NotEmpty(message = "Informe ao menos um item de avaliação.")
        @Valid
        List<AvaliacaoItemRequest> itens
) {
}
