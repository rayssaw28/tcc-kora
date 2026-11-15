package com.korainc.conformia_api.exception;

/**
 * Lançada quando o login está temporariamente bloqueado por excesso de tentativas falhas.
 */
public class LoginBloqueadoException extends RuntimeException {

    private final long segundosRestantes;

    public LoginBloqueadoException(String message, long segundosRestantes) {
        super(message);
        this.segundosRestantes = segundosRestantes;
    }

    public long getSegundosRestantes() {
        return segundosRestantes;
    }
}
