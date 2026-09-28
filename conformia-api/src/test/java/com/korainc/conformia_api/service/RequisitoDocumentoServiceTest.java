package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.RequisitoDocumentoRequest;
import com.korainc.conformia_api.entity.RequisitoDocumento;
import com.korainc.conformia_api.enums.TipoDocumento;
import com.korainc.conformia_api.repository.RequisitoDocumentoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequisitoDocumentoServiceTest {

    @Mock
    private RequisitoDocumentoRepository repository;
    @Mock
    private NotificacaoFuncionarioService notificacaoService;

    @InjectMocks
    private RequisitoDocumentoService service;

    @Test
    @DisplayName("Soft delete: recriar requisito inativo reativa o cadastro existente")
    void recriarRequisitoInativoReativaCadastro() {
        RequisitoDocumento requisito = RequisitoDocumento.builder()
                .titulo("CPF")
                .tipo(TipoDocumento.CPF)
                .build();
        requisito.setId(3L);
        RequisitoDocumentoRequest request =
                new RequisitoDocumentoRequest("CPF", TipoDocumento.CPF, "Documento fiscal");

        when(repository.existsByTituloIgnoreCase("CPF")).thenReturn(false);
        when(repository.findIdInativoByTitulo("CPF")).thenReturn(Optional.of(3L));
        when(repository.findById(3L)).thenReturn(Optional.of(requisito));

        service.criar(request);

        verify(repository).reativar(3L, "CPF", "CPF", "Documento fiscal");
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
