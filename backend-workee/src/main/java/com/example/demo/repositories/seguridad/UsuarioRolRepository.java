package com.example.demo.repositories.seguridad;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.dtos.metricas.admin.UsuariosPorRolDTO;
import com.example.demo.dtos.seguridad.UsuarioResponseDTO;
import com.example.demo.entities.seguridad.UsuarioRol;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface UsuarioRolRepository extends BaseRepository<UsuarioRol, Long> {

    @Query(
        """
            SELECT COUNT(ur) > 0 FROM UsuarioRol ur
            WHERE ur.rol.id = :idRol 
            AND ur.fechaHoraBaja IS NULL
            AND ur.usuario.fechaHoraBaja IS NULL
        """
    )
    Boolean existenUsuariosActivosConRol(@Param("idRol") Long idRol);

    @Query(
        """
             SELECT new com.example.demo.dtos.seguridad.UsuarioResponseDTO(ur.usuario.id, ur.usuario.urlFotoUsuario, ur.usuario.correoUsuario, ur.rol.nombreRol, null, ur.rol.categoriaRol.id)  
             FROM UsuarioRol ur
             WHERE ur.usuario.fechaHoraBaja IS NULL
             AND ur.fechaHoraBaja IS NULL
        """
    )
    public List<UsuarioResponseDTO> buscarUsuariosActivos();

    @Query(
        """
             SELECT new com.example.demo.dtos.seguridad.UsuarioResponseDTO(ur.usuario.id, ur.usuario.urlFotoUsuario, ur.usuario.correoUsuario, ur.rol.nombreRol, null, ur.rol.categoriaRol.id)  
             FROM UsuarioRol ur
             WHERE ur.usuario.fechaHoraBaja IS NULL
             AND ur.fechaHoraBaja IS NULL
             AND ur.rol.id IN :idsRol
        """
    )
    public List<UsuarioResponseDTO> buscarUsuariosActivosPorRol(List<Long> idsRol);


    @Query(
        value = "SELECT * FROM usuario_rol " + 
            "WHERE fecha_hora_baja IS NULL " + 
            "AND id_usuario = :idUsuario",
        nativeQuery = true
    )
    public Optional<UsuarioRol> buscarUsuarioRolActualSegunIdUsuario(Long idUsuario);

    @Query(
        value = "SELECT * FROM usuario_rol " +  
            "WHERE id_usuario = :idUsuario AND id_rol = :idRol",
        nativeQuery = true
    )
    public Optional<UsuarioRol> buscarUsuarioRolAnteriorSegunIdUsuarioEIdRol(Long idRol, Long idUsuario);

    

    @Query(
        value = "SELECT * FROM usuario_rol " + 
                "WHERE id_usuario = :idUsuario " +
                "ORDER BY fecha_hora_alta ASC " +
                "LIMIT 1",
        nativeQuery = true
    )
    public Optional<UsuarioRol> obtenerUsuarioRolMasViejo(@Param("idUsuario") Long idUsuario);

    @Query(
        """
            SELECT new com.example.demo.dtos.metricas.admin.UsuariosPorRolDTO(
                r.nombreRol, r.codigoRol, COUNT(DISTINCT u), 0.0 
            )
            FROM UsuarioRol ur
            JOIN ur.usuario u
            JOIN ur.rol r
            JOIN u.usuarioEstadoList ue
            JOIN ue.estadoUsuario e
            WHERE ur.fechaHoraBaja IS NULL
            AND u.fechaHoraBaja IS NULL
            AND ue.fechaHoraBaja IS NULL
            AND e.codigoEstadoUsuario NOT IN ('RECHAZADO', 'PENDIENTE')
            AND u.fechaHoraAlta BETWEEN :fechaDesde AND :fechaHasta
            GROUP BY r.codigoRol, r.nombreRol
        """
    )
    public List<UsuariosPorRolDTO> obtenerDistribucionUsuariosPorRol(@Param("fechaDesde") LocalDateTime fechaDesde, @Param("fechaHasta") LocalDateTime fechaHasta);


    
}

