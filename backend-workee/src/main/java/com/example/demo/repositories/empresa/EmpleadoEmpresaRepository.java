package com.example.demo.repositories.empresa;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface EmpleadoEmpresaRepository extends BaseRepository<EmpleadoEmpresa, Long> {
     @Query(
        value = "SELECT COUNT(*) FROM empleado_empresa e " + 
                "WHERE e.id_empresa = :idEmpresa " + 
                "AND e.fecha_hora_baja IS NULL",
        nativeQuery = true
    )
     public Long contarEmpelados(@Param("idEmpresa") Long idEmpresa);


     @Query(
        value = "SELECT * FROM empleado_empresa e " + 
                "WHERE e.fecha_hora_baja IS NULL AND e.id_empresa = :idEmpresa " + 
                "ORDER BY e.fecha_hora_alta DESC",
        nativeQuery = true
     )
     public List<EmpleadoEmpresa> traerEmpleadosActivos(@Param("idEmpresa") Long idEmpresa);
     
     List<EmpleadoEmpresa> findAllByIdIn(Collection<Long> ids);


     Optional<EmpleadoEmpresa> findByUsuarioId(Long usuarioId);

     @Query(
        value = "SELECT * FROM empleado_empresa e " + 
                "WHERE e.id_empresa = :idEmpresa " + 
                "ORDER BY e.fecha_hora_alta DESC",
        nativeQuery = true
     )
     public List<EmpleadoEmpresa> traerTodosLosEmpleadosDeUnaEmpresa(@Param("idEmpresa") Long idEmpresa);

     Boolean existsByUsuarioId(Long usuarioId);

     //Optional<EmpleadoEmpresa> findByUsuarioId(Long usuarioId);
     
}