package com.example.demo.repositories.seguridad;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario, Long>{
    
    public Boolean existsByFechaHoraBajaIsNullAndCorreoUsuarioLike(String correo);

    @Query(
        value = "SELECT * FROM usuario " + 
            "WHERE correo_usuario LIKE :correo " + 
            "AND fecha_hora_baja IS NULL",
        nativeQuery = true
    )
    public Optional<Usuario> buscarUsuarioPorCorreo(@Param("correo") String correo);


    @Query(
        """
            SELECT COUNT(u) FROM Usuario u
            JOIN u.usuarioEstadoList ue
            JOIN ue.estadoUsuario e
            WHERE u.fechaHoraBaja IS NULL
            AND ue.fechaHoraBaja IS NULL AND e.codigoEstadoUsuario NOT IN ('PENDIENTE', 'RECHAZADO')
        """
    )
    public Integer cantidadHistoricaUsuariosActivos();


    @Query(value = """
        SELECT p.nombre_pais AS nombrePais, SUM(sub.cantidad) AS cantidadUsuarios
        FROM (
            SELECT c.id_provincia AS id_provincia, COUNT(*) AS cantidad
            FROM candidato c
            JOIN usuario u ON c.id_usuario = u.id
            JOIN usuario_estado_usuario ue ON ue.id_usuario = u.id
            JOIN estado_usuario eu ON eu.id = ue.id_estado_usuario
            WHERE u.fecha_hora_baja IS NULL
            AND ue.fecha_hora_baja IS NULL
            AND eu.codigo_estado_usuario NOT IN ('PENDIENTE', 'RECHAZADO')
            AND u.fecha_hora_alta BETWEEN :fechaDesde AND :fechaHasta
            GROUP BY c.id_provincia

            UNION ALL

            SELECT e.id_provincia AS id_provincia, COUNT(*) AS cantidad
            FROM empresa e
            JOIN usuario u ON e.id_usuario = u.id
            JOIN usuario_estado_usuario ue ON ue.id_usuario = u.id
            JOIN estado_usuario eu ON eu.id = ue.id_estado_usuario
            WHERE u.fecha_hora_baja IS NULL
            AND ue.fecha_hora_baja IS NULL
            AND eu.codigo_estado_usuario NOT IN ('PENDIENTE', 'RECHAZADO')
            AND u.fecha_hora_alta BETWEEN :fechaDesde AND :fechaHasta
            GROUP BY e.id_provincia

            UNION ALL

            SELECT emp.id_provincia AS id_provincia, COUNT(*) AS cantidad
            FROM empleado_empresa ee
            JOIN empresa emp ON ee.id_empresa = emp.id
            JOIN usuario u ON ee.id_usuario = u.id
            JOIN usuario_estado_usuario ue ON ue.id_usuario = u.id
            JOIN estado_usuario eu ON eu.id = ue.id_estado_usuario
            WHERE u.fecha_hora_baja IS NULL
            AND ue.fecha_hora_baja IS NULL
            AND eu.codigo_estado_usuario NOT IN ('PENDIENTE', 'RECHAZADO')
            AND u.fecha_hora_alta BETWEEN :fechaDesde AND :fechaHasta
            GROUP BY emp.id_provincia
        ) AS sub
        JOIN provincia pr ON sub.id_provincia = pr.id
        JOIN pais p ON pr.id_pais = p.id
        GROUP BY p.id, p.nombre_pais
        ORDER BY cantidadUsuarios DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> contarUsuariosPorPaisTop5(@Param("fechaDesde") LocalDateTime fechaDesde, @Param("fechaHasta") LocalDateTime fechaHasta); //TODO: REVISAR
    

    @Query(value = """
            SELECT DATE(u.fecha_hora_alta) AS fecha, COUNT(*) AS cantidad
            FROM usuario u
            WHERE u.fecha_hora_alta BETWEEN :desde AND :hasta
            GROUP BY DATE(u.fecha_hora_alta)
            ORDER BY fecha
            """,
            nativeQuery = true)
    List<Object[]> evolucionUsuarios(@Param("desde") LocalDateTime desde,
                                    @Param("hasta") LocalDateTime hasta);
}

