package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.Perfil;

import java.util.List;

public record OrganogramaNode(
        Long id,
        String nome,
        String cargoNome,
        String departamentoNome,
        Perfil perfil,
        List<OrganogramaNode> subordinados
) {
}
