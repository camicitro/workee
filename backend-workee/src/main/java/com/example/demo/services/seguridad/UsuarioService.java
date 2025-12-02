package com.example.demo.services.seguridad;

import java.util.List;

import com.example.demo.dtos.login.LoginRequestDTO;
import com.example.demo.dtos.seguridad.RecuperarContraseniaDTO;
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.dtos.seguridad.UsuarioResponseDTO;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.services.BaseService;

public interface UsuarioService extends BaseService<Usuario, Long>{
    public Usuario registrarUsuario(UsuarioDTO usuarioDTO);

    public void actualizarContraseniaUsuario(Long idUsuario, String nuevaContrasenia, String repetirContrasenia, String contraseniaActual);
    
    public void actualizarFotoPerfilUsuario(Long idUsuario, String urlFotoPerfil);

    public void darDeBajaUsuario(Long idUsuario);
    public void habilitarUsuario(Long idUsuario);

    public void solicitarRecuperarContrasenia(String correoUsuario);

    public void confirmarRecuperacionContrasenia(String idEncriptado, RecuperarContraseniaDTO recuperarContraseniaDTO);

    public List<UsuarioResponseDTO> buscarUsuariosActivos();

    public List<UsuarioResponseDTO> buscarUsuariosActivosPorRol(List<Long> idsRol);

    public void modificarRolUsuario(Long idUsuario, Long idRol);

    public UsuarioResponseDTO visualizarDetalleUsuario(Long idUsuario);

    public void confirmarTokenCandidato(String token);

    public Usuario obtenerUsuarioAutenticado();
    
    public String login(LoginRequestDTO loginRequestDTO);

    public String obtenerCodigoRolMasViejo(Long idUsuario);

    public Long obtenerIdUsuarioPorCorreo(String correo);
}

