package com.korainc.conformia_api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptServiceTest {

    private static final class RelogioMutavel extends Clock {
        private Instant agora = Instant.parse("2026-01-01T00:00:00Z");

        void avancar(Duration d) {
            agora = agora.plus(d);
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return agora;
        }
    }

    private RelogioMutavel relogio;
    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        relogio = new RelogioMutavel();
        service = new LoginAttemptService(5, Duration.ofMinutes(15), Duration.ofMinutes(15), relogio);
    }

    private void falhas(String chave, int n) {
        for (int i = 0; i < n; i++) {
            service.registrarFalha(chave);
        }
    }

    @Test
    @DisplayName("Não bloqueia abaixo do limite")
    void naoBloqueiaAbaixoDoLimite() {
        String chave = LoginAttemptService.chaveEmail("a@conformia.com");
        falhas(chave, 4);
        assertFalse(service.estaBloqueado(chave));
        assertEquals(0, service.segundosRestantesBloqueio(chave));
    }

    @Test
    @DisplayName("Bloqueia ao atingir o limite")
    void bloqueiaAoAtingirLimite() {
        String chave = LoginAttemptService.chaveEmail("a@conformia.com");
        falhas(chave, 5);
        assertTrue(service.segundosRestantesBloqueio(chave) > 0);
        assertEquals(15 * 60, service.segundosRestantesBloqueio(chave));
    }

    @Test
    @DisplayName("E-mail é normalizado (caixa e espaços)")
    void chaveNormalizada() {
        service.registrarFalha(LoginAttemptService.chaveEmail("Usuario@Conformia.com "));
        service.registrarFalha(LoginAttemptService.chaveEmail(" usuario@conformia.com"));
        service.registrarFalha(LoginAttemptService.chaveEmail("USUARIO@CONFORMIA.COM"));
        service.registrarFalha(LoginAttemptService.chaveEmail("usuario@conformia.com"));
        service.registrarFalha(LoginAttemptService.chaveEmail("usuario@conformia.com  "));
        assertTrue(service.estaBloqueado(LoginAttemptService.chaveEmail("usuario@conformia.com")));
    }

    @Test
    @DisplayName("Sucesso zera o contador")
    void sucessoResetaContador() {
        String chave = LoginAttemptService.chaveEmail("a@conformia.com");
        falhas(chave, 2);
        service.registrarSucesso(chave);
        falhas(chave, 1);
        assertFalse(service.estaBloqueado(chave));
        falhas(chave, 3);
        assertFalse(service.estaBloqueado(chave));
    }

    @Test
    @DisplayName("Chaves de e-mail e IP são independentes")
    void chavesIndependentes() {
        String email = LoginAttemptService.chaveEmail("a@conformia.com");
        String ip = LoginAttemptService.chaveIp("10.0.0.1");
        falhas(email, 5);
        assertTrue(service.estaBloqueado(email));
        assertFalse(service.estaBloqueado(ip));
    }

    @Test
    @DisplayName("Bloqueio expira após o período configurado")
    void bloqueioExpira() {
        String chave = LoginAttemptService.chaveIp("10.0.0.1");
        falhas(chave, 5);
        relogio.avancar(Duration.ofMinutes(14));
        assertTrue(service.estaBloqueado(chave));
        relogio.avancar(Duration.ofMinutes(1));
        assertFalse(service.estaBloqueado(chave));
        falhas(chave, 4);
        assertFalse(service.estaBloqueado(chave));
    }

    @Test
    @DisplayName("Falhas fora da janela não são contabilizadas")
    void falhasForaDaJanelaSaoIgnoradas() {
        String chave = LoginAttemptService.chaveEmail("a@conformia.com");
        falhas(chave, 4);
        relogio.avancar(Duration.ofMinutes(16));
        falhas(chave, 1);
        assertFalse(service.estaBloqueado(chave));
    }

    @Test
    @DisplayName("Falhas durante o bloqueio não estendem o bloqueio")
    void falhasDuranteBloqueioNaoEstendem() {
        String chave = LoginAttemptService.chaveEmail("a@conformia.com");
        falhas(chave, 5);
        relogio.avancar(Duration.ofMinutes(10));
        falhas(chave, 10);
        relogio.avancar(Duration.ofMinutes(5));
        assertFalse(service.estaBloqueado(chave));
    }

    @Test
    @DisplayName("Limpeza remove entradas expiradas e mantém as ativas")
    void limpezaRemoveExpiradas() {
        falhas(LoginAttemptService.chaveEmail("a@conformia.com"), 2);
        relogio.avancar(Duration.ofMinutes(20));
        falhas(LoginAttemptService.chaveEmail("b@conformia.com"), 5);
        service.limparExpirados();
        assertEquals(1, service.tamanho());
    }
}
