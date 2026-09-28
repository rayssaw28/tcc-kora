package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Perfil;
import jakarta.validation.constraints.NotNull;

public record FuncionarioProfissionalRequest(
        @NotNull(message = "O perfil é obrigatório.")
        Perfil perfil,
        Long departamentoId,
        Long cargoId,
        Long gestorId
) {
}
