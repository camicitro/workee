package com.example.demo.repositories.seguridad.tokens;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.tokens.TokenRecuperacion;

@Repository
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long>{
    public Optional<TokenRecuperacion> findByToken(String token);

    @Modifying
    @Query("""
        UPDATE TokenRecuperacion t 
        SET t.fechaUso = :fechaUso 
        WHERE t.usuario.id = :idUsuario 
        AND t.fechaUso IS NULL 
        AND t.fechaExpiracion > :now 
        """)
    void invalidarTokensActivosDelUsuario(@Param("idUsuario") Long idUsuario, @Param("fechaUso") LocalDateTime fechaUso, @Param("now") LocalDateTime now);

    @Query("""
        SELECT t FROM TokenRecuperacion t 
        WHERE t.usuario.id = :idUsuario 
        AND t.fechaUso IS NULL 
        AND t.fechaExpiracion > CURRENT_TIMESTAMP 
        ORDER BY t.fechaCreacion DESC
        """)
    Optional<TokenRecuperacion> findUltimoTokenActivo(@Param("idUsuario") Long idUsuario);


}
