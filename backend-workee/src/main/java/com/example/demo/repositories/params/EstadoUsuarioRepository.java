package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.EstadoUsuario;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface EstadoUsuarioRepository extends BaseRepository<EstadoUsuario, Long> {
    
    @Query(
        value = "SELECT * FROM estado_usuario WHERE fecha_hora_baja IS NULL " + 
               "ORDER BY nombre_estado_usuario ASC",
        nativeQuery = true
    )
    List<EstadoUsuario> buscarEstadosActivos();

    List<EstadoUsuario> findAllByOrderByNombreEstadoUsuarioAsc();

    Optional<EstadoUsuario> findByNombreEstadoUsuarioIgnoreCase(String nombreEstadoUsuario);

    EstadoUsuario findByCodigoEstadoUsuarioAndFechaHoraBajaIsNull(String codigoEstadoUsuario);

    boolean existsByCodigoEstadoUsuario(String codigoEstado);
}
