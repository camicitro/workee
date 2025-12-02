package com.example.demo.repositories.seguridad;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.UsuarioEstadoUsuario;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface UsuarioEstadoUsuarioRepository extends BaseRepository<UsuarioEstadoUsuario, Long>{

    @Query(value = """
        SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
        FROM usuario_estado_usuario ue
        JOIN usuario u ON ue.id_usuario = u.id
        WHERE ue.id_estado_usuario = :estadoUsuarioId
        AND ue.fecha_hora_baja IS NULL
        AND u.fecha_hora_baja IS NULL
    """, nativeQuery = true)
    Long existsUsuariosActivosConEstado(@Param("estadoUsuarioId") Long estadoUsuarioId);

}
