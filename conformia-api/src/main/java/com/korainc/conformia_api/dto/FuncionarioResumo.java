package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Perfil;

public record FuncionarioResumo(
        Long id,
        String nome,
        String email,
        Perfil perfil
) {
}
