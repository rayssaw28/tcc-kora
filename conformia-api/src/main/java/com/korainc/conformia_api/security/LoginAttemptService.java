package com.korainc.conformia_api.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controle em memória de tentativas de login falhas.
 * <p>
 * Cada chave (por exemplo {@code email:x} ou {@code ip:y}) acumula falhas dentro de uma janela de tempo;
 * ao atingir o limite, a chave fica bloqueada por um período. Um sucesso zera o contador.
 */
@Service
public class LoginAttemptService {

    private final int maxTentativas;
    private final long janelaMs;
    private final long bloqueioMs;
    private final Clock clock;

    private final Map<String, Entrada> entradas = new ConcurrentHashMap<>();

    @Autowired
    public LoginAttemptService(
            @Value("${security.login.max-tentativas:5}") int maxTentativas,
            @Value("${security.login.janela-minutos:15}") long janelaMinutos,
            @Value("${security.login.bloqueio-minutos:15}") long bloqueioMinutos) {
        this(maxTentativas, Duration.ofMinutes(janelaMinutos), Duration.ofMinutes(bloqueioMinutos),
                Clock.systemUTC());
    }

    LoginAttemptService(int maxTentativas, Duration janela, Duration bloqueio, Clock clock) {
        if (maxTentativas < 1) {
            throw new IllegalArgumentException("security.login.max-tentativas deve ser >= 1");
        }
        this.maxTentativas = maxTentativas;
        this.janelaMs = janela.toMillis();
        this.bloqueioMs = bloqueio.toMillis();
        this.clock = clock;
    }

    public static String chaveEmail(String email) {
        return "email:" + normalizar(email);
    }

    public static String chaveIp(String ip) {
        return "ip:" + normalizar(ip);
    }

    /** Segundos restantes de bloqueio da chave; 0 se não estiver bloqueada. */
    public long segundosRestantesBloqueio(String chave) {
        long agora = clock.millis();
        Entrada e = entradas.get(normalizar(chave));
        if (e == null) {
            return 0;
        }
        synchronized (e) {
            long restanteMs = e.bloqueadoAte - agora;
            if (restanteMs <= 0) {
                return 0;
            }
            return (restanteMs + 999) / 1000;
        }
    }

    public boolean estaBloqueado(String chave) {
        return segundosRestantesBloqueio(chave) > 0;
    }

    public void registrarFalha(String chave) {
        long agora = clock.millis();
        entradas.compute(normalizar(chave), (k, e) -> {
            Entrada entrada = e != null ? e : new Entrada();
            synchronized (entrada) {
                if (entrada.bloqueadoAte > agora) {
                    return entrada; // já bloqueada: não estende o bloqueio
                }
                entrada.bloqueadoAte = 0;
                while (!entrada.falhas.isEmpty() && agora - entrada.falhas.peekFirst() >= janelaMs) {
                    entrada.falhas.pollFirst();
                }
                entrada.falhas.addLast(agora);
                if (entrada.falhas.size() >= maxTentativas) {
                    entrada.bloqueadoAte = agora + bloqueioMs;
                    entrada.falhas.clear();
                }
            }
            return entrada;
        });
    }

    public void registrarSucesso(String chave) {
        entradas.remove(normalizar(chave));
    }

    /** Remove entradas sem bloqueio ativo e sem falhas dentro da janela. */
    @Scheduled(fixedDelay = 10 * 60 * 1000L, initialDelay = 10 * 60 * 1000L)
    public void limparExpirados() {
        long agora = clock.millis();
        entradas.entrySet().removeIf(en -> {
            Entrada e = en.getValue();
            synchronized (e) {
                boolean bloqueada = e.bloqueadoAte > agora;
                boolean falhasRecentes = !e.falhas.isEmpty() && agora - e.falhas.peekLast() < janelaMs;
                return !bloqueada && !falhasRecentes;
            }
        });
    }

    int tamanho() {
        return entradas.size();
    }

    private static String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase(Locale.ROOT);
    }

    private static final class Entrada {
        private final Deque<Long> falhas = new ArrayDeque<>();
        private long bloqueadoAte;
    }
}
