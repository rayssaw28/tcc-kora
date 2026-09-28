package com.korainc.conformia_api.dto;

import com.korainc.conformia_api.enums.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RequisitoDocumentoRequest(
        @NotBlank @Size(max = 120) String titulo,
        @NotNull TipoDocumento tipo,
        @Size(max = 255) String descricao
) {
}
