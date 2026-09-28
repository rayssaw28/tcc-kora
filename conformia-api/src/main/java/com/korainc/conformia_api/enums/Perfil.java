package com.korainc.conformia_api.enums;

public enum Perfil {

    ADMIN,

    GESTOR,

    FUNCIONARIO;

    public String authority() {
        return "ROLE_" + name();
    }
}
