package com.korainc.conformia_api.dto;

public record FuncionarioFeedbackResumo(
        Long id,
        String nome,
        Long departamentoId,
        String departamentoNome,
        String cargoNome
) {
}
