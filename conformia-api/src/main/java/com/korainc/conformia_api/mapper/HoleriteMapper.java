package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.HoleriteResponse;
import com.korainc.conformia_api.entity.Holerite;
import org.springframework.stereotype.Component;

@Component
public class HoleriteMapper {

    public HoleriteResponse toResponse(Holerite h) {
        return new HoleriteResponse(
                h.getId(),
                h.getFuncionario().getId(),
                h.getFuncionario().getNome(),
                h.getFuncionario().getDepartamento() != null
                        ? h.getFuncionario().getDepartamento().getNome()
                        : null,
                h.getMes(),
                h.getAno(),
                h.getNomeArquivo(),
                h.getContentType(),
                h.getTamanhoBytes(),
                h.getCriadoEm()
        );
    }
}
