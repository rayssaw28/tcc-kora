package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.DocumentoResponse;
import com.korainc.conformia_api.entity.Documento;
import org.springframework.stereotype.Component;

@Component
public class DocumentoMapper {

    public DocumentoResponse toResponse(Documento d) {
        return new DocumentoResponse(
                d.getId(),
                d.getFuncionario().getId(),
                d.getRequisito() != null ? d.getRequisito().getId() : null,
                d.getTipo(),
                d.getTituloPersonalizado(),
                d.getNomeArquivo(),
                d.getContentType(),
                d.getTamanhoBytes(),
                d.getStatus(),
                d.getMotivoReprovacao(),
                d.getCriadoEm()
        );
    }
}
