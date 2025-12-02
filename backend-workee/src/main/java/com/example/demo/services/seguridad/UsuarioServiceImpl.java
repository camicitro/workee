package com.example.demo.services.seguridad;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.login.LoginRequestDTO;
import com.example.demo.dtos.seguridad.RecuperarContraseniaDTO;
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.dtos.seguridad.UsuarioResponseDTO;
import com.example.demo.entities.params.CodigoEstadoUsuario;
import com.example.demo.entities.params.EstadoUsuario;
import com.example.demo.entities.seguridad.Rol;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.seguridad.UsuarioEstadoUsuario;
import com.example.demo.entities.seguridad.UsuarioRol;
import com.example.demo.entities.seguridad.tokens.TokenConfirmacion;
import com.example.demo.entities.seguridad.tokens.TokenRecuperacion;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.mappers.UsuarioMapper;
import com.example.demo.repositories.seguridad.UsuarioRepository;
import com.example.demo.repositories.seguridad.UsuarioRolRepository;
import com.example.demo.repositories.seguridad.tokens.TokenConfirmacionRepository;
import com.example.demo.repositories.seguridad.tokens.TokenRecuperacionRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.NombreEntidadResolverService;
import com.example.demo.services.mail.MailService;
import com.example.demo.services.params.EstadoUsuarioService;

import jakarta.transaction.Transactional;

@Service
public class UsuarioServiceImpl extends BaseServiceImpl<Usuario, Long> implements UsuarioService{

    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final TokenConfirmacionRepository tokenConfirmacionRepository;

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final EstadoUsuarioService estadoUsuarioService;
    private final UsuarioRolRepository usuarioRolRepository;
    private final RolService rolService;
    private final NombreEntidadResolverService nombreEntidadResolverService;
    private final MailService mailService;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${firebase.storage.token}")
    private String firebaseToken;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper, EstadoUsuarioService estadoUsuarioService, 
    MailService mailService, UsuarioRolRepository usuarioRolRepository, RolService rolService, NombreEntidadResolverService nombreEntidadResolverService, 
    BCryptPasswordEncoder bCryptPasswordEncoder, TokenRecuperacionRepository tokenRecuperacionRepository, TokenConfirmacionRepository tokenConfirmacionRepository,
    AuthenticationManager authenticationManager,JwtUtil jwtUtil) {
        super(usuarioRepository);
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.estadoUsuarioService = estadoUsuarioService;
        this.mailService = mailService;
        this.usuarioRolRepository = usuarioRolRepository;
        this.rolService = rolService;
        this.nombreEntidadResolverService = nombreEntidadResolverService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.tokenRecuperacionRepository = tokenRecuperacionRepository;
        this.tokenConfirmacionRepository = tokenConfirmacionRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    


    @Override
    @Transactional
    public Usuario registrarUsuario(UsuarioDTO usuarioDTO){
        if(existeUsuarioConCorreo(usuarioDTO.getCorreoUsuario())){
            throw new EntityAlreadyExistsException("El correo ingresado ya se encuentra en uso");
        }
        if(usuarioDTO.getUrlFotoUsuario() == null || usuarioDTO.getUrlFotoUsuario().isBlank()){
            usuarioDTO.setUrlFotoUsuario("https://firebasestorage.googleapis.com/v0/b/workee-406b2.firebasestorage.app/o/foto%2Ffoto-perfil.png?alt=media&token=" + firebaseToken);

        }
        String contraseniaCodificada = encriptarContrasenia(usuarioDTO.getContraseniaUsuario());

        Usuario nuevoUsuario = usuarioMapper.toEntity(usuarioDTO);
        nuevoUsuario.setContraseniaUsuario(contraseniaCodificada);
        nuevoUsuario.setFechaHoraAlta(new Date());

        //Se guarda para que tenga el ID
        usuarioRepository.save(nuevoUsuario);

        //Seteo del estado
        EstadoUsuario estadoUsuario = estadoUsuarioService.obtenerEstadoPorCodigo(usuarioDTO.getEstadoUsuarioInicial()); 
        UsuarioEstadoUsuario usuarioEstadoUsuario = new UsuarioEstadoUsuario();
        usuarioEstadoUsuario.setEstadoUsuario(estadoUsuario);
        usuarioEstadoUsuario.setFechaHoraAlta(new Date());
        nuevoUsuario.setUsuarioEstadoList(new ArrayList<>());
        nuevoUsuario.getUsuarioEstadoList().add(usuarioEstadoUsuario);

        //Seteo del rol
        Rol rol = rolService.buscarRolPorCodigoRol(usuarioDTO.getRolUsuario());
        UsuarioRol nuevoUsuarioRol = new UsuarioRol();
        nuevoUsuarioRol.setFechaHoraAlta(new Date());
        nuevoUsuarioRol.setUsuario(nuevoUsuario);
        nuevoUsuarioRol.setRol(rol);

        usuarioRolRepository.save(nuevoUsuarioRol);


        return usuarioRepository.save(nuevoUsuario);
        
    }

    private String encriptarContrasenia(String contrasenia){
        //String contraseniaEncriptada = contrasenia;
        String contraseniaEncriptada = bCryptPasswordEncoder.encode(contrasenia);
        return contraseniaEncriptada; 
    }
    
    private Boolean existeUsuarioConCorreo(String correoUsuario){
        return usuarioRepository.existsByFechaHoraBajaIsNullAndCorreoUsuarioLike(correoUsuario);
    }

    @Override
    @Transactional
    public void actualizarContraseniaUsuario(Long idUsuario, String nuevaContrasenia, String repetirContrasenia, String contraseniaActual){
        Usuario usuario = findById(idUsuario);
        
        if(nuevaContrasenia.isBlank() || repetirContrasenia.isBlank() || contraseniaActual.isBlank()){
            throw new EntityNotValidException("Debe ingresar el campo faltante");
        }
        if(nuevaContrasenia.length() < 8 || repetirContrasenia.length() < 8){
            throw new EntityNotValidException("Las contrasñas deben tener al menos 8 caracteres");
        }

        if(!nuevaContrasenia.equals(repetirContrasenia)){
            throw new EntityNotValidException("Las contraseñas deben coincidir");
        }
        
        if(!bCryptPasswordEncoder.matches(contraseniaActual, usuario.getContraseniaUsuario())){
            throw new EntityNotValidException("La contraseña actual ingresada no coincide con la contraseña guardada");
        }
        String contrasenia = modificarContrasenia(nuevaContrasenia, repetirContrasenia);
        usuario.setContraseniaUsuario(contrasenia);
        
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void actualizarFotoPerfilUsuario(Long idUsuario, String urlFotoPerfil){
        Usuario usuario = findById(idUsuario);
        if(urlFotoPerfil != null && !urlFotoPerfil.isBlank()){
            usuario.setUrlFotoUsuario(urlFotoPerfil);
        }
        usuarioRepository.save(usuario);
    }
    
    @Transactional
    private String modificarContrasenia(String contrasenia, String repetirContrasenia){
        if(contrasenia == null || repetirContrasenia == null){
            throw new EntityNotValidException("La contraseña no puede estar vacía");
        }
        if(contrasenia.length() < 8 || repetirContrasenia.length() < 8){
            throw new EntityNotValidException("La contraseña debe tener al menos 8 caracteres");
        }
        if(!contrasenia.equals(repetirContrasenia)){
            throw new EntityNotValidException("Las contraseñas deben coincidir");
        }

        String contraseniaEncriptada = encriptarContrasenia(contrasenia);

        return contraseniaEncriptada;

    }

    //ESTE LO DA DE BAJA SIN VERIFICAR SI YA ESTABA DADO DE BAJA (es para cuando se elimina)
    @Override
    @Transactional
    public void darDeBajaUsuario(Long idUsuario){
        Usuario usuario = findById(idUsuario);
        usuario.setFechaHoraBaja(new Date());
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void habilitarUsuario(Long idUsuario){
        Usuario usuario = findById(idUsuario);
        usuario.setFechaHoraBaja(null);
        
        Optional<UsuarioEstadoUsuario> usuarioEstadoUsuarioOp = usuario.getUsuarioEstadoList().stream()
            .filter(ue -> ue.getFechaHoraBaja() == null)
            .findFirst();
        
        if(!usuarioEstadoUsuarioOp.isPresent()){
            throw new EntityNotFoundException("El usuario no tiene un estado actual asignado");
        }
        
        if(!usuarioEstadoUsuarioOp.get().getEstadoUsuario().getCodigoEstadoUsuario().equals(CodigoEstadoUsuario.HABILITADO)){
            UsuarioEstadoUsuario usuarioEstadoUsuarioViejo = usuarioEstadoUsuarioOp.get();
            usuarioEstadoUsuarioViejo.setFechaHoraBaja(new Date());
            EstadoUsuario estadoNuevo = estadoUsuarioService.obtenerEstadoPorCodigo(CodigoEstadoUsuario.HABILITADO);
            UsuarioEstadoUsuario usuarioEstadoUsuarioNuevo = new UsuarioEstadoUsuario();
            usuarioEstadoUsuarioNuevo.setFechaHoraAlta(new Date());
            usuarioEstadoUsuarioNuevo.setEstadoUsuario(estadoNuevo);
            usuario.getUsuarioEstadoList().add(usuarioEstadoUsuarioNuevo);
        }
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void solicitarRecuperarContrasenia(String correoUsuario){
        Optional<Usuario> usuario = usuarioRepository.buscarUsuarioPorCorreo(correoUsuario);
        
        if(!usuario.isPresent()){
            throw new EntityNotFoundException("No se encontró un usuario con el correo ingresado");
        }
        Usuario usuarioEncontrado = usuario.get();

        Optional<TokenRecuperacion> ultimoToken = tokenRecuperacionRepository.findUltimoTokenActivo(usuarioEncontrado.getId());
        if (ultimoToken.isPresent() && ultimoToken.get().getFechaCreacion().isAfter(LocalDateTime.now().minusMinutes(5))) {
            throw new EntityNotValidException("Ya se envió un correo de recuperación recientemente. Esperá 5 minutos.");
        }


        //Si reenvia el mail para recup contraseña entonces invalida el que se habia guardado antes
        tokenRecuperacionRepository.invalidarTokensActivosDelUsuario(usuarioEncontrado.getId(), LocalDateTime.now(), LocalDateTime.now());
        
        //Token para recuperar contraseña
        String token = UUID.randomUUID().toString();

        TokenRecuperacion tokenRecuperacion = new TokenRecuperacion();
        tokenRecuperacion.setToken(token);
        LocalDateTime fechaCreacion = LocalDateTime.now();
        tokenRecuperacion.setFechaCreacion(fechaCreacion);
        tokenRecuperacion.setFechaExpiracion(fechaCreacion.plusMinutes(30));
        tokenRecuperacion.setUsuario(usuarioEncontrado);
        
        tokenRecuperacionRepository.save(tokenRecuperacion);
        
        //Enviar link
        String linkRecuperacion = "http://localhost:4200/nuevaContrasenia?token=" + token;
        enviarMailRecuperacionAUsuario(usuarioEncontrado.getCorreoUsuario(), linkRecuperacion);
    }

    private void enviarMailRecuperacionAUsuario(String mailTo, String urlrecuperacion){
        String templateName = "recuperacionContrasenia";
        Map<String, Object> variables = new HashMap<>();
        variables.put("urlrecuperacion", urlrecuperacion);
        String subject = "Recupera tu contraseña";
        mailService.enviar(mailTo, subject, templateName, variables);
    }

    @Transactional
    @Override
    public void confirmarRecuperacionContrasenia(String token, RecuperarContraseniaDTO recuperarContraseniaDTO){
        if(!recuperarContraseniaDTO.getContraseniaNueva().equals(recuperarContraseniaDTO.getRepetirContrasenia())){
            throw new EntityNotValidException("Las contraseñas no coinciden");
        }

        Optional<TokenRecuperacion> tokenRecuperacionOptional = tokenRecuperacionRepository.findByToken(token);
        if(!tokenRecuperacionOptional.isPresent()){
            throw new EntityNotValidException("El token es inválido o inexistente");
        }
        TokenRecuperacion tokenRecuperacion = tokenRecuperacionOptional.get();
        if(tokenRecuperacion.getFechaExpiracion().isBefore(LocalDateTime.now())){
            throw new EntityNotValidException("El token ha expirado");
        }
        if(tokenRecuperacion.getFechaUso() != null){
            throw new EntityNotValidException("El token ya fue utilizado");
        }
        
        Usuario usuario = tokenRecuperacion.getUsuario();

        String contraseniaEncriptada = encriptarContrasenia(recuperarContraseniaDTO.getContraseniaNueva());

        tokenRecuperacion.setFechaUso(LocalDateTime.now());
        tokenRecuperacionRepository.save(tokenRecuperacion);
        
        usuario.setContraseniaUsuario(contraseniaEncriptada);
        usuarioRepository.save(usuario);
    }

    @Override
    public List<UsuarioResponseDTO> buscarUsuariosActivosPorRol(List<Long> idsRol){
        System.out.println("entre al service");
        if(idsRol == null || idsRol.isEmpty()){
            throw new EntityNotValidException("La lista de ids de rol no puede estar vacía");
        }

        List<UsuarioResponseDTO> usuarios = usuarioRolRepository.buscarUsuariosActivosPorRol(idsRol);
        for (UsuarioResponseDTO usuario : usuarios) {
            String nombreEntidad = nombreEntidadResolverService.obtenerNombreEntidadPorIdUsuario(usuario.getIdUsuario());
            usuario.setNombreEntidad(nombreEntidad);
        }
        return usuarios;
    }

    @Override
    @Transactional
    public void modificarRolUsuario(Long idUsuario, Long idRol){
        if(idUsuario == null){
            throw new EntityNotValidException("El id del usuario no puede estar vacio");
        }
        if(idRol == null){
            throw new EntityNotValidException("El id del rol no puede estar vacio");
        }

        Optional<UsuarioRol> actual = usuarioRolRepository.buscarUsuarioRolActualSegunIdUsuario(idUsuario);
        if(!actual.isPresent()){
            throw new EntityNotFoundException("El usuario no posee ningún rol actual");
        }
        UsuarioRol usuarioRolActual = actual.get();
        if(idRol == usuarioRolActual.getRol().getId()){
            throw new EntityAlreadyExistsException("El usuario actualmente posee el rol ingresado");
        }

        Boolean sonMismaCategoria = verificarQueRolPerteneceACategoria(idRol, usuarioRolActual.getRol().getId());
        if(!sonMismaCategoria){
            throw new EntityNotValidException("El rol ingresado no pertenece a la categoria de roles del usuario");
        }

        //Optional<UsuarioRol> usuarioRolExistenteOptional = usuarioRolRepository.buscarUsuarioRolAnteriorSegunIdUsuarioEIdRol(idRol, idUsuario);
        /*if(usuarioRolExistenteOptional.isPresent()){
            UsuarioRol usuarioRolExistente = usuarioRolExistenteOptional.get();
            usuarioRolExistente.setFechaHoraBaja(null);
            usuarioRolRepository.save(usuarioRolExistente);*/
        //} else {
            Rol rolNuevo = rolService.buscarRolActivoPorId(idRol);
            Usuario usuario = findById(idUsuario);

            UsuarioRol nuevoUsuarioRol = new UsuarioRol();
            nuevoUsuarioRol.setRol(rolNuevo);
            nuevoUsuarioRol.setFechaHoraAlta(new Date());
            nuevoUsuarioRol.setUsuario(usuario);
            usuarioRolRepository.save(nuevoUsuarioRol);
        //}

        usuarioRolActual.setFechaHoraBaja(new Date());
        usuarioRolRepository.save(usuarioRolActual);
    }

    private Boolean verificarQueRolPerteneceACategoria(Long idRolNuevo, Long idRolActual){
        Rol rolNuevo = rolService.findById(idRolNuevo);
        Rol rolActual = rolService.findById(idRolActual);

        if(rolActual.getCategoriaRol().getId() != rolNuevo.getCategoriaRol().getId()){
            return false;
        } else {
            return true;
        }
    }

    @Override
    public UsuarioResponseDTO visualizarDetalleUsuario(Long idUsuario){
        Usuario usuario = findById(idUsuario);

        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO();
        usuarioResponseDTO.setCorreoUsuario(usuario.getCorreoUsuario());
        usuarioResponseDTO.setIdUsuario(idUsuario);
        usuarioResponseDTO.setUrlFotoUsuario(usuario.getUrlFotoUsuario());

        String nombreUsuario = nombreEntidadResolverService.obtenerNombreEntidadPorIdUsuario(idUsuario);
        usuarioResponseDTO.setNombreEntidad(nombreUsuario);
        
        Optional<UsuarioRol> usuarioRolOptional = usuarioRolRepository.buscarUsuarioRolActualSegunIdUsuario(idUsuario);

        if(usuarioRolOptional.isPresent()){
            UsuarioRol usuarioRol = usuarioRolOptional.get();
            usuarioResponseDTO.setIdCategoria(usuarioRol.getRol().getCategoriaRol().getId());
            usuarioResponseDTO.setRolActualusuario(usuarioRol.getRol().getNombreRol());
        }

        return usuarioResponseDTO;
    }

    @Override
    public List<UsuarioResponseDTO> buscarUsuariosActivos(){
        List<UsuarioResponseDTO> usuarios = usuarioRolRepository.buscarUsuariosActivos();
        for (UsuarioResponseDTO usuario : usuarios) {
            String nombreEntidad = nombreEntidadResolverService.obtenerNombreEntidadPorIdUsuario(usuario.getIdUsuario());
            usuario.setNombreEntidad(nombreEntidad);
        }
        return usuarios;
    }

    @Override
    @Transactional
    public void confirmarTokenCandidato(String token){
        Optional<TokenConfirmacion> tokenConfirmacionOptional = tokenConfirmacionRepository.findByToken(token);
        if(!tokenConfirmacionOptional.isPresent()){
            throw new EntityNotValidException("El token es inválido o inexistente");
        }
        TokenConfirmacion tokenConfirmacion = tokenConfirmacionOptional.get();
        if(tokenConfirmacion.getFechaExpiracion().isBefore(LocalDateTime.now())){
            throw new EntityNotValidException("El token ha expirado");
        }
        if(tokenConfirmacion.getFechaUso() != null){
            throw new EntityNotValidException("El token ya fue utilizado");
        }
        
        tokenConfirmacion.setFechaUso(LocalDateTime.now());
        
        Long idUsuario = tokenConfirmacion.getUsuario().getId();
        verificarCandidato(idUsuario);

        tokenConfirmacionRepository.save(tokenConfirmacion);
    }

    @Transactional
    private void verificarCandidato(Long idUsuario){
        Usuario usuario = findById(idUsuario);

        //Actual (PENDIENTE)
        Optional<UsuarioEstadoUsuario> usuarioEstadoActualOptional = usuario.getUsuarioEstadoList().stream()
            .filter(e -> e.getFechaHoraBaja() == null)
            .max(Comparator.comparing(UsuarioEstadoUsuario::getFechaHoraAlta));

        if(usuarioEstadoActualOptional.isPresent()){
            UsuarioEstadoUsuario usuarioEstadoUsuarioActual = usuarioEstadoActualOptional.get();
            usuarioEstadoUsuarioActual.setFechaHoraBaja(new Date());
        }

        //Nuevo (HABILITADO)
        EstadoUsuario estadoUsuarioNuevo = estadoUsuarioService.obtenerEstadoPorCodigo(CodigoEstadoUsuario.HABILITADO);
        UsuarioEstadoUsuario usuarioEstadoUsuarioNuevo = new UsuarioEstadoUsuario();
        usuarioEstadoUsuarioNuevo.setEstadoUsuario(estadoUsuarioNuevo);
        usuarioEstadoUsuarioNuevo.setFechaHoraAlta(new Date());

        usuario.getUsuarioEstadoList().add(usuarioEstadoUsuarioNuevo);

        usuarioRepository.save(usuario);
    }

    @Override
     public Usuario obtenerUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); 
        return usuarioRepository.buscarUsuarioPorCorreo(email).orElseThrow(() ->
            new RuntimeException("Usuario no encontrado")
        );
    }


    @Override
    public String login(LoginRequestDTO loginRequestDTO) {
        Optional<Usuario> usuarioOptional = usuarioRepository.buscarUsuarioPorCorreo(loginRequestDTO.getCorreo());
        if(!usuarioOptional.isPresent()){
            throw new EntityNotFoundException("No se encontró un usuario con el correo ingresado");
        }
        Usuario usuario = usuarioOptional.get();
        boolean estadoHabilitado = usuario.getUsuarioEstadoList().stream()
            .anyMatch(estado ->
                estado.getEstadoUsuario().getCodigoEstadoUsuario().equals(CodigoEstadoUsuario.HABILITADO) 
                && 
                estado.getFechaHoraBaja() == null);
        
        if(!estadoHabilitado){
            throw new EntityNotValidException("El usuario no se encuentra habilitado para iniciar sesión");
        }
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequestDTO.getCorreo(),
                loginRequestDTO.getContrasenia()
            )
        );
         UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        return jwtUtil.generateToken(userDetails);
    }

    @Override
    public String obtenerCodigoRolMasViejo(Long idUsuario){
        Optional<UsuarioRol> usuarioRolOptional = usuarioRolRepository.obtenerUsuarioRolMasViejo(idUsuario);
        if(!usuarioRolOptional.isPresent()){
            throw new EntityNotFoundException("No se encontró el rol buscado");
        }

        UsuarioRol usuarioRol = usuarioRolOptional.get();

        return usuarioRol.getRol().getCodigoRol();
    }

    @Override
    public Long obtenerIdUsuarioPorCorreo(String correo){
        Optional<Usuario> usuarioOptional = usuarioRepository.buscarUsuarioPorCorreo(correo);
        if(!usuarioOptional.isPresent()){
            throw new EntityNotFoundException("No existe un usuario con el correo ingresado");
        }
        Usuario usuario = usuarioOptional.get();

        return usuario.getId();
    }

}
