package com.korainc.conformia_api.dto;

import org.springframework.core.io.Resource;

public record ArquivoDownload(
        Resource resource,
        String nomeArquivo,
        String contentType,
        Long funcionarioId
) {
}
