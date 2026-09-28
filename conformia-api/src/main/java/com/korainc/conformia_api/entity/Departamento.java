package com.korainc.conformia_api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "departamento")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE departamento SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class Departamento extends BaseEntity {

    @Column(nullable = false, length = 120, unique = true)
    private String nome;

    @Column(length = 255)
    private String descricao;
}
