package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.OrganogramaNode;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.korainc.conformia_api.repository.FuncionarioRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganogramaServiceTest {

    @Mock
    private FuncionarioRepository repository;

    @InjectMocks
    private OrganogramaService service;

    private Funcionario func(long id, String nome, Funcionario gestor) {
        Funcionario f = new Funcionario();
        f.setId(id);
        f.setNome(nome);
        f.setPerfil(Perfil.FUNCIONARIO);
        f.setGestor(gestor);
        return f;
    }

    @Test
    @DisplayName("RF06: monta a árvore (1 raiz, com filho e neto)")
    void montaArvore() {
        Funcionario raiz = func(1, "Raiz", null);
        Funcionario filho = func(2, "Filho", raiz);
        Funcionario neto = func(3, "Neto", filho);
        when(repository.findAllParaOrganograma()).thenReturn(List.of(raiz, filho, neto));

        List<OrganogramaNode> organograma = service.completo();

        assertEquals(1, organograma.size());
        OrganogramaNode noRaiz = organograma.get(0);
        assertEquals("Raiz", noRaiz.nome());
        assertEquals(1, noRaiz.subordinados().size());
        assertEquals("Filho", noRaiz.subordinados().get(0).nome());
        assertEquals("Neto", noRaiz.subordinados().get(0).subordinados().get(0).nome());
    }

    @Test
    @DisplayName("RF06: ciclo (funcionário gestor de si mesmo) não causa loop infinito")
    void cicloNaoTravaA() {
        Funcionario f = new Funcionario();
        f.setId(1L);
        f.setNome("Ciclico");
        f.setPerfil(Perfil.FUNCIONARIO);
        f.setGestor(f);
        when(repository.findAllParaOrganograma()).thenReturn(List.of(f));

        OrganogramaNode no = service.subarvore(1L);

        assertEquals("Ciclico", no.nome());

        assertTrue(no.subordinados().size() <= 1);
        if (!no.subordinados().isEmpty()) {
            assertTrue(no.subordinados().get(0).subordinados().isEmpty());
        }
    }
}
