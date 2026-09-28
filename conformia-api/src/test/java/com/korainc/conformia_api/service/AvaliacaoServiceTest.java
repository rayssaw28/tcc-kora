package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.FeedbackRequest;
import com.korainc.conformia_api.entity.AvaliacaoDesempenho;
import com.korainc.conformia_api.entity.AvaliacaoItem;
import com.korainc.conformia_api.enums.StatusAvaliacao;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.mapper.AvaliacaoMapper;
import com.korainc.conformia_api.repository.AvaliacaoDesempenhoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvaliacaoServiceTest {

    @Mock
    private AvaliacaoDesempenhoRepository repository;
    @Mock
    private FuncionarioRepository funcionarioRepository;
    @Mock
    private AvaliacaoMapper mapper;

    @InjectMocks
    private AvaliacaoService service;

    private AvaliacaoDesempenho comNotas(StatusAvaliacao status, int... notas) {
        AvaliacaoDesempenho a = AvaliacaoDesempenho.builder().status(status).build();
        for (int n : notas) {
            a.getItens().add(AvaliacaoItem.builder().criterio("c").nota(n).build());
        }
        return a;
    }

    @Test
    @DisplayName("RF11: finalizar calcula a média (5,5,4 → 4.67) e muda status")
    void finalizarCalculaMedia() {
        AvaliacaoDesempenho a = comNotas(StatusAvaliacao.RASCUNHO, 5, 5, 4);
        when(repository.findById(1L)).thenReturn(Optional.of(a));
        lenient().when(repository.save(a)).thenReturn(a);

        service.finalizar(1L);

        assertEquals(4.67, a.getNotaFinal());
        assertEquals(StatusAvaliacao.FINALIZADA, a.getStatus());
    }

    @Test
    @DisplayName("RF11: não finaliza/edita avaliação que não está em RASCUNHO")
    void naoEditaSeFinalizada() {
        AvaliacaoDesempenho a = comNotas(StatusAvaliacao.FINALIZADA, 3);
        when(repository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(BusinessException.class, () -> service.finalizar(1L));
    }

    @Test
    @DisplayName("Não permite enviar feedback para si mesmo")
    void naoEnviaFeedbackParaSiMesmo() {
        assertThrows(
                BusinessException.class,
                () -> service.enviarFeedback(
                        1L, new FeedbackRequest(1L, "2026-1", "Teste", java.util.List.of()))
        );
    }
}
