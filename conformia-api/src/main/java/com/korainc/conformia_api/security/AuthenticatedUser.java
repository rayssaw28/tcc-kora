package com.korainc.conformia_api.security;

import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class AuthenticatedUser implements UserDetails {

    private final Funcionario funcionario;

    public Long getId() {
        return funcionario.getId();
    }

    public boolean isAdmin() {
        return funcionario.getPerfil() == Perfil.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(funcionario.getPerfil().authority()));
    }

    @Override
    public String getPassword() {
        return funcionario.getSenhaHash();
    }

    @Override
    public String getUsername() {
        return funcionario.getEmail();
    }

    @Override
    public boolean isEnabled() {
        // Reforça o bloqueio de contas inativas no Spring Security.
        return funcionario.isAtivo();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
