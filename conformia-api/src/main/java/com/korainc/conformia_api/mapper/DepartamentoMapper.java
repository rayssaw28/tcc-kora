package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.DepartamentoRequest;
import com.korainc.conformia_api.dto.DepartamentoResponse;
import com.korainc.conformia_api.entity.Departamento;
import org.springframework.stereotype.Component;

@Component
public class DepartamentoMapper {

    public Departamento toEntity(DepartamentoRequest request) {
        return Departamento.builder()
                .nome(request.nome())
                .descricao(request.descricao())
                .build();
    }

    public void updateEntity(Departamento entity, DepartamentoRequest request) {
        entity.setNome(request.nome());
        entity.setDescricao(request.descricao());
    }

    public DepartamentoResponse toResponse(Departamento entity) {
        return new DepartamentoResponse(
                entity.getId(),
                entity.getNome(),
                entity.getDescricao(),
                entity.isAtivo(),
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }
}
