package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.BeneficioResponse;
import com.korainc.conformia_api.dto.BeneficioAdminResponse;
import com.korainc.conformia_api.entity.Beneficio;
import org.springframework.stereotype.Component;

@Component
public class BeneficioMapper {

    public BeneficioResponse toResponse(Beneficio b) {
        return new BeneficioResponse(
                b.getId(),
                b.getFuncionario().getId(),
                b.getTipo(),
                b.getValor(),
                b.getDescricao(),
                b.getCriadoEm()
        );
    }

    public BeneficioAdminResponse toAdminResponse(Beneficio b) {
        return new BeneficioAdminResponse(
                b.getId(),
                b.getFuncionario().getId(),
                b.getFuncionario().getNome(),
                b.getTipo(),
                b.getValor(),
                b.getDescricao(),
                b.getCriadoEm()
        );
    }
}
