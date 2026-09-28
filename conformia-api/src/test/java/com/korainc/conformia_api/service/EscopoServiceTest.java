package com.korainc.conformia_api.service;

import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.security.AuthenticatedUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EscopoServiceTest {

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @InjectMocks
    private EscopoService escopoService;

    private Funcionario funcionario(long id, Perfil perfil, Funcionario gestor) {
        Funcionario f = new Funcionario();
        f.setId(id);
        f.setPerfil(perfil);
        f.setGestor(gestor);
        return f;
    }

    @Test
    @DisplayName("RN01: gestor enxerga subordinado direto")
    void subordinadoDireto() {
        Funcionario gestor = funcionario(2, Perfil.GESTOR, null);
        Funcionario direto = funcionario(3, Perfil.FUNCIONARIO, gestor);
        when(funcionarioRepository.findById(3L)).thenReturn(Optional.of(direto));

        assertTrue(escopoService.estaNoEscopoDoGestor(2L, 3L));
    }

    @Test
    @DisplayName("RN01: gestor enxerga subordinado indireto (árvore)")
    void subordinadoIndireto() {
        Funcionario gestor = funcionario(2, Perfil.GESTOR, null);
        Funcionario direto = funcionario(3, Perfil.FUNCIONARIO, gestor);
        Funcionario indireto = funcionario(4, Perfil.FUNCIONARIO, direto);
        when(funcionarioRepository.findById(4L)).thenReturn(Optional.of(indireto));
        when(funcionarioRepository.findById(3L)).thenReturn(Optional.of(direto));

        assertTrue(escopoService.estaNoEscopoDoGestor(2L, 4L));
    }

    @Test
    @DisplayName("RN01: gestor NÃO enxerga quem está fora da sua árvore")
    void foraDaArvore() {
        Funcionario outro = funcionario(5, Perfil.FUNCIONARIO, null);
        when(funcionarioRepository.findById(5L)).thenReturn(Optional.of(outro));

        assertFalse(escopoService.estaNoEscopoDoGestor(2L, 5L));
    }

    @Test
    @DisplayName("RN01: ADMIN vê todos; gestor respeita o escopo; funcionário vê só a si")
    void podeAcessarRespeitaPerfis() {
        Funcionario admin = funcionario(1, Perfil.ADMIN, null);
        Funcionario gestor = funcionario(2, Perfil.GESTOR, null);
        Funcionario direto = funcionario(3, Perfil.FUNCIONARIO, gestor);

        AuthenticatedUser adminUser = new AuthenticatedUser(admin);
        AuthenticatedUser gestorUser = new AuthenticatedUser(gestor);

        lenient().when(funcionarioRepository.findById(3L)).thenReturn(Optional.of(direto));
        lenient().when(funcionarioRepository.findById(5L))
                .thenReturn(Optional.of(funcionario(5, Perfil.FUNCIONARIO, null)));

        assertTrue(escopoService.podeAcessar(adminUser, 999L));
        assertTrue(escopoService.podeAcessar(gestorUser, 2L));
        assertTrue(escopoService.podeAcessar(gestorUser, 3L));
        assertFalse(escopoService.podeAcessar(gestorUser, 5L));
    }
}
