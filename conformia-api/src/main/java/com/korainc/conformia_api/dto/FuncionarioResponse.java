package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.EstadoCivil;
import com.korainc.conformia_api.enums.Genero;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.UfBrasil;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;

public record FuncionarioResponse(
        Long id,
        String nome,
        String cpf,
        String email,
        Perfil perfil,
        StatusAdmissao statusAdmissao,
        String telefone,
        LocalDate dataNascimento,
        LocalDate dataAdmissao,
        OffsetDateTime dataDesligamento,
        String motivoDesligamento,
        Long desligadoPorId,
        String desligadoPorNome,
        Set<String> nacionalidades,
        UfBrasil ufNatal,
        String cidadeNatal,
        Genero genero,
        String nomeSocial,
        EstadoCivil estadoCivil,
        boolean ativo,
        Long departamentoId,
        String departamentoNome,
        Long cargoId,
        String cargoNome,
        Long gestorId,
        String gestorNome,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
