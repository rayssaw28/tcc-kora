package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.AvaliacaoItemResponse;
import com.korainc.conformia_api.dto.AvaliacaoResponse;
import com.korainc.conformia_api.entity.AvaliacaoDesempenho;
import org.springframework.stereotype.Component;

@Component
public class AvaliacaoMapper {

    public AvaliacaoResponse toResponse(AvaliacaoDesempenho a) {
        return new AvaliacaoResponse(
                a.getId(),
                a.getAvaliado().getId(),
                a.getAvaliado().getNome(),
                a.getAvaliador().getId(),
                a.getAvaliador().getNome(),
                a.getPeriodo(),
                a.getComentarioGeral(),
                a.getNotaFinal(),
                a.getStatus(),
                a.getItens().stream()
                        .map(i -> new AvaliacaoItemResponse(i.getId(), i.getCriterio(), i.getNota(), i.getComentario()))
                        .toList(),
                a.getCriadoEm(),
                a.getAtualizadoEm()
        );
    }
}
