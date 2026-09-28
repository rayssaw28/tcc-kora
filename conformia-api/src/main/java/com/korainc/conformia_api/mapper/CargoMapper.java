package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.CargoRequest;
import com.korainc.conformia_api.dto.CargoResponse;
import com.korainc.conformia_api.entity.Cargo;
import org.springframework.stereotype.Component;

@Component
public class CargoMapper {

    public Cargo toEntity(CargoRequest request) {
        return Cargo.builder()
                .nome(request.nome())
                .descricao(request.descricao())
                .build();
    }

    public void updateEntity(Cargo entity, CargoRequest request) {
        entity.setNome(request.nome());
        entity.setDescricao(request.descricao());
    }

    public CargoResponse toResponse(Cargo entity) {
        return new CargoResponse(
                entity.getId(),
                entity.getNome(),
                entity.getDescricao(),
                entity.getDepartamento() != null ? entity.getDepartamento().getId() : null,
                entity.getDepartamento() != null ? entity.getDepartamento().getNome() : null,
                entity.getLiderDireto() != null ? entity.getLiderDireto().getId() : null,
                entity.getLiderDireto() != null ? entity.getLiderDireto().getNome() : null,
                entity.isAtivo(),
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }
}
