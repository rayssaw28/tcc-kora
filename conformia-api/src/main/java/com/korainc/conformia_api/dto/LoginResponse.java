package com.korainc.conformia_api.dto;

public record LoginResponse(
        String token,
        String tipo,
        long expiraEmMs,
        boolean trocaSenhaObrigatoria,
        FuncionarioResumo funcionario
) {
}
