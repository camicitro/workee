package com.example.demo.repositories.seguridad;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.Rol;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface RolRepository extends BaseRepository<Rol, Long>{
    public List<Rol> findAllByOrderByNombreRolAsc();

    public boolean existsByNombreRol(String nombreRol);

    public List<Rol> findAllByCategoriaRolIdAndFechaHoraBajaIsNull(Long categoriaRolId);

    public Optional<Rol> findByIdAndFechaHoraBajaIsNull(Long idRol);
    
    public boolean existsByCodigoRol(String codigoRol);

    public Rol findByCodigoRolAndFechaHoraBajaIsNull(String codigoRol);
    @Query("""
            SELECT ur.rol FROM UsuarioRol ur 
            WHERE ur.usuario.correoUsuario = :correo
        """)
    List<Rol> findRolesByCorreoUsuario(@Param("correo") String correo); //mala practica xd, ver si despues lo movemos al repo q corresponde

    @Query("""
            SELECT ur.rol FROM UsuarioRol ur 
            WHERE ur.usuario.correoUsuario = :correo
            AND ur.fechaHoraBaja IS NULL
        """)
    Optional<Rol> findRolActualByCorreoUsuario(@Param("correo") String correo); //mala practica xd ver si despues lo movemos al repo q corresponde
    
}