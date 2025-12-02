package com.example.demo.repositories.seguridad;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.PermisoRol;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface PermisoRolRepository extends BaseRepository<PermisoRol, Long>{

    @Query(
        value = "SELECT * FROM permiso_rol " + 
            "WHERE id_rol = :rolId AND fecha_hora_baja IS NULL",
        nativeQuery = true
    )
    public List<PermisoRol> buscarPermisosActivosPorRol(@Param("rolId")Long rolId);
}
