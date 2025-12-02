package com.example.demo.repositories.seguridad.tokens;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.tokens.TokenConfirmacion;

@Repository
public interface TokenConfirmacionRepository extends JpaRepository<TokenConfirmacion, Long>{
    public Optional<TokenConfirmacion> findByToken(String token);
}
