import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Pais } from '../../../../admin/ABMPais/pais';
import { Provincia } from '../../../../admin/ABMProvincia/provincia';
import { PaisService } from '../../../../admin/ABMPais/pais.service';
import { ProvinciaService } from '../../../../admin/ABMProvincia/provincia.service';
import { GeneroService } from '../../../../admin/ABMGenero/genero.service';
//import { CandidatoService } from '../../../../modulos/Candidato/candidato.service';
import { EstadoBusquedaLaboralService } from '../../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral.service';
import { EstadoBusquedaLaboral } from '../../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral';
import { Genero } from '../../../../admin/ABMGenero/genero';
import Swal from 'sweetalert2';
import { url } from 'inspector';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Habilidad } from '../../../../admin/ABMHabilidad/habilidad';
import { HabilidadService } from '../../../../admin/ABMHabilidad/habilidad.service';
import { CandidatoHabilidad } from '../../../candidato/candidato-habilidad';
import { AuthService } from '../../auth.service';
import { Storage, ref, uploadBytes, getDownloadURL, StorageReference} from '@angular/fire/storage';
import { SpinnerComponent } from "../../../../compartidos/spinner/spinner/spinner.component";
import { SeleccionHabilidadesComponent } from '../../../candidato/perfil-candidato/seleccion-habilidades/seleccion-habilidades.component';

@Component({
  selector: 'app-registro-candidato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpinnerComponent],
  templateUrl: './registro-candidato.component.html',
  styleUrl: './registro-candidato.component.css'
})
export class RegistroCandidatoComponent {
  isLoading: boolean = false;


  candidatoForm: FormGroup;
  submitForm: boolean = false;
  backendEmailInvalido = false;
  verContrasenia: boolean = false;
  backendContraseniaCorta = false;
  backendContraseniasNoCoinciden = false;
  numeropaginaregistro: number = 1;
  fotoTemporal: string = '';
  CVTemporal: any = null;


  modalRef?: NgbModalRef;
  paises: Pais[] =[];
  provincias: Provincia[] = [];
  provinciasDePais: Provincia[] = [];
  generos: Genero[] = [];
  estadosBusquedas: EstadoBusquedaLaboral[] = [];
  todasHabilidades: Habilidad[] = [];
  paisSeleccionado?: Pais;
  provinciaSeleccionada?: Provincia;
  generoSeleccionado?: Genero;
  estadoBusquedaSeleccionado?: EstadoBusquedaLaboral;
  habilidadesSeleccionadasID: number[] = []; // array de ids de las habildiades que le quedaron al candidato
  habilidadesFinales: any; // array de habilidades que le quedaron al candidato
  today: Date = new Date();

  habilidades: CandidatoHabilidad[] = []; // listado de habilidades seleccionadas por el usuario
  candidato: any = {}; // necesario solo para hacer `this.candidato.habilidades ?? []`

  //PARA FOTO DE PERFIL
  urlFoto = '';
  file!: File;
  imgRef!: StorageReference;

  //PARA CV
  urlCV = '';
  fileCV: any = null;
  docRef!: StorageReference;


constructor(
  private router: Router,
  private paisService: PaisService,
  private provinciaService: ProvinciaService,
  private generoService: GeneroService,
  private estadoBusquedaService: EstadoBusquedaLaboralService,
  private authService: AuthService,
  private modalService: ModalService,
  private habilidadService: HabilidadService,
  private storage: Storage,
  private changeDetectorRef: ChangeDetectorRef

) {
  this.candidatoForm = new FormGroup({
    nombreCandidato: new FormControl('', [Validators.required]),
    apellidoCandidato: new FormControl('', [Validators.required]),
    fechaDeNacimiento: new FormControl('', [
    Validators.required,
    this.mayorDeEdadValidator(18)
  ]),
    provinciaCandidato: new FormControl(null, [Validators.required]),
    paisCandidato: new FormControl(null, [Validators.required]),
    estadoBusquedaCandidato: new FormControl(''),
    generoCandidato: new FormControl(null, [Validators.required]),
    habilidadesCandidato: new FormControl(''),
    enlaceCV: new FormControl(''),
    correoCandidato: new FormControl('', [Validators.required, Validators.email]),
    contrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
    repetirContrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
    urlFotoPerfil: new FormControl(''),
    terminosCondiciones: new FormControl(false, [Validators.requiredTrue]),
  })
}

ngOnInit(): void {
  this.generoService.findAllActivos().subscribe({ //CAMBIAR A FINDALL ACTIVE
      next: (data) => {
        this.generos = data;
        // console.log(this.paises)
      },
      error: (error) => {
        console.error('Error al obtener generos', error);
      }
  })

  this.paisService.findAllActivos().subscribe({
      next: (data) => {
        this.paises = data;
        // console.log(this.paises)
      },
      error: (error) => {
        console.error('Error al obtener paises', error);
      }
  })

  this.provinciaService.findAllActivas().subscribe({
      next: (data) => {
        this.provincias = data;
        },
      error: (error) => {
        console.error('Error al obtener provincias', error);
      }
  })

  this.estadoBusquedaService.findAllActivos().subscribe({
      next: (data) => {
        this.estadosBusquedas = data;
        // console.log(this.provincias)
      },
      error: (error) => {
        console.error('Error al obtener rubros', error);
      }
  })

  this.habilidadService.findAllActivas().subscribe(habilidades => {
      this.todasHabilidades = habilidades;
  });

  this.habilidades = [];
}

mayorDeEdadValidator(minEdad: number = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fechaNacimiento = control.value;
    if (!fechaNacimiento) return null; // si no hay valor, no valida aquí
    
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    // Ajustar si no ha cumplido años todavía
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    return edad >= minEdad ? null : { menorDeEdad: true };
  };
}

isFechaInvalida(): boolean {
  const control = this.candidatoForm.get('fechaDeNacimiento');
  return !!control && control.invalid && (control.touched || control.dirty);
}

isFechaMenorDeEdad(): boolean {
  const control = this.candidatoForm.get('fechaDeNacimiento');
  return !!control && control.value && control.errors?.['menorDeEdad'] && (control.touched || control.dirty);
}



async enviarDatos() {
  this.backendEmailInvalido = false;
  this.submitForm = true;

  if (this.candidatoForm.invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Formulario incompleto',
      text: 'Por favor, complete todos los campos obligatorios y acepte los Términos y Condiciones.',
      confirmButtonColor: '#31a5dd'
    });
    return;
  }

  const contrasenia = this.candidatoForm.get('contrasenia')?.value;
  const repetirContrasenia = this.candidatoForm.get('repetirContrasenia')?.value;

  if (contrasenia !== repetirContrasenia) {
    this.backendContraseniasNoCoinciden = true;
    this.candidatoForm.get('contrasenia')?.setErrors({ backend: true });
    this.candidatoForm.get('repetirContrasenia')?.setErrors({ backend: true });
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Las contraseñas no coinciden",
      timer: 3000,
      showConfirmButton: false,
    });
    return;
  }

  try {
    this.isLoading = true;
    let urlFotoPerfil = '';
    let enlaceCV = '';

    // Subir la imagen si existe
    if (this.file) {
      this.imgRef = ref(this.storage, `foto/${this.file.name}`);
      const snapshot = await uploadBytes(this.imgRef, this.file);
      urlFotoPerfil = await getDownloadURL(snapshot.ref);
    }

    if (this.fileCV) {
      this.docRef = ref(this.storage, `cv/${this.fileCV.name}`);
      const snapshot = await uploadBytes(this.docRef, this.fileCV);
      enlaceCV = await getDownloadURL(snapshot.ref);
    }

    // Obtener valores del formulario
    const nombreCandidato = this.candidatoForm.get('nombreCandidato')?.value;
    const apellidoCandidato = this.candidatoForm.get('apellidoCandidato')?.value;
    const fechaDeNacimiento = this.candidatoForm.get('fechaDeNacimiento')?.value;
    const provinciaSeleccionada = this.candidatoForm.get('provinciaCandidato')?.value.id;
    const estadoBusquedaSeleccionado = this.candidatoForm.get('estadoBusquedaCandidato')?.value.id;
    const generoSeleccionado = this.candidatoForm.get('generoCandidato')?.value.id; 
    // const enlaceCV = this.candidatoForm.get('CVCandidato')?.value;
    const correoCandidato = this.candidatoForm.get('correoCandidato')?.value;

    // Llamar al servicio
    this.authService.registrarCandidato(
      nombreCandidato,
      apellidoCandidato,
      fechaDeNacimiento,
      provinciaSeleccionada,
      estadoBusquedaSeleccionado,
      generoSeleccionado,
      this.habilidadesSeleccionadasID,
      enlaceCV,
      correoCandidato,
      contrasenia,
      repetirContrasenia,
      urlFotoPerfil
    ).subscribe({
      next: () => {
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 100);
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Ya estás registrado. Revisa tu correo para verificar tu cuenta.",
          showConfirmButton: false,
          showCloseButton: true,
          timer: 6000,
          timerProgressBar: false,
          position: "center",
        });
        
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.error.message === "El correo ingresado ya se encuentra en uso") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "El correo ingresado se encuentra en uso, ingrese otro",
            timer: 3000,
            showConfirmButton: false,
          });
        }
        if (error.status === 400 && error.error.message === "Debe ser un correo válido") {
          this.backendEmailInvalido = true;
          this.candidatoForm.get('correoCandidato')?.setErrors({ backend: true });
        } else if (error.status === 400 && error.error.message === "La contraseña debe tener al menos 8 caracteres") {
          this.backendContraseniaCorta = true;
          this.candidatoForm.get('contrasenia')?.setErrors({ backend: true });
        }
      }
    });

  } catch (error) {
    this.isLoading = false;
    console.error('Error al subir la imagen:', error);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Error al subir la imagen',
      showConfirmButton: false,
      timer: 3000
    });
  }
}

isCampoInvalido(nombreCampo: string): boolean {
  const control = this.candidatoForm.get(nombreCampo);
  return !!(control && control.invalid && (control.touched || this.submitForm));
}

seleccionarHabilidades() {
  this.modalRef = this.modalService.open(SeleccionHabilidadesComponent, {
    centered: true,
    scrollable: true,
    size: 'lg'
  });

  this.modalRef.componentInstance.habilidadesSeleccionadas = [...this.habilidades];

  // PARA RECIBIR LAS HABILIDADES ACA Y ENVIARLAS EN LA REQUEST
  this.modalRef.result.then(
    (result) => {
      if (result) {
        this.habilidadesSeleccionadasID = result;

        const habilidadesFinales: CandidatoHabilidad[] = result.map((id: number | undefined) => {
          const habilidadEncontrada = this.todasHabilidades.find(h => h.id === id);
          return {
            habilidad: habilidadEncontrada
          } as CandidatoHabilidad;
        }).filter((ch: { habilidad: undefined; }) => ch.habilidad !== undefined);

        this.habilidades = habilidadesFinales;
        }
      }
    )
}

get habilidadesParaMostrar(): CandidatoHabilidad[] {
  return this.habilidadesFinales === undefined ? this.habilidades : this.habilidadesFinales;
}

compararPais = (p1: Pais, p2: Pais) => p1 && p2 ? p1.id === p2.id : p1 === p2;
compararProvincia = (p1: Provincia, p2: Provincia) => p1 && p2 ? p1.id === p2.id : p1 === p2;
compararGenero = (r1: Genero, r2: Genero) => r1 && r2 ? r1.id === r2.id : r1 === r2;
compararEstadoBusqueda = (e1: EstadoBusquedaLaboral, e2: EstadoBusquedaLaboral) => e1 && e2 ? e1.id === e2.id : e1 === e2;

siguientepagina() {
  this.numeropaginaregistro ++;
}

paginaAnterior() {
  this.numeropaginaregistro --;
}

filtrarProvinciasPorPais(paisSeleccionado: Pais | null) {
  if (!paisSeleccionado) {
      this.provinciasDePais = [];
      const pais = this.candidatoForm.get('paisCandidato')?.value;
      return;
  }

  this.provinciasDePais = this.provincias.filter(
      provincia => provincia.pais?.id === paisSeleccionado.id
  );

  this.paisSeleccionado = paisSeleccionado;

  }

  verterminosycondiciones() {
    Swal.fire({
      title: 'Términos y Condiciones de Uso',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px;">
          <p><strong>1. Introducción</strong></p>
          <p>
            Bienvenido/a a <strong>Workee</strong>, una plataforma diseñada para conectar 
            candidatos y empresas en procesos de selección transparentes, eficientes y seguros. 
            Al registrarse, acceder o utilizar la plataforma, usted acepta los presentes 
            Términos y Condiciones. Si no está de acuerdo con alguno de ellos, debe abstenerse de utilizar el servicio.
          </p>

          <p><strong>2. Definiciones</strong></p>
          <p>
            <strong>“Plataforma”</strong>: el sitio web y todos los servicios, módulos, APIs y funcionalidades de Workee.<br>
            <strong>“Usuario”</strong>: toda persona que use la plataforma, ya sea con rol de Candidato, Empresa o Administrador.<br>
            <strong>“Candidato”</strong>: persona que crea un perfil y se postula a ofertas laborales.<br>
            <strong>“Empresa”</strong>: organización que publica vacantes, gestiona postulaciones y participa en procesos de selección.
          </p>

          <p><strong>3. Registro y Cuentas</strong></p>
          <p>
            Los usuarios deben registrarse con información veraz, completa y actualizada. 
            Cada usuario es responsable de mantener la confidencialidad de sus credenciales. 
            Workee no será responsable por accesos no autorizados o uso indebido de cuentas. 
            Está prohibido crear cuentas falsas o en nombre de terceros sin autorización.
          </p>

          <p><strong>4. Uso del Sistema</strong></p>
          <p>
            <u>Para Candidatos:</u> pueden crear su perfil, cargar CV, postularse a ofertas, 
            participar en entrevistas y visualizar el estado de sus postulaciones.<br><br>
            <u>Para Empresas:</u> pueden publicar vacantes, revisar perfiles, contactar candidatos, 
            realizar entrevistas y analizar métricas de sus procesos.<br><br>
            Se prohíbe cualquier uso que implique fraude, suplantación de identidad, 
            discriminación o publicación de información falsa. El incumplimiento podrá derivar 
            en suspensión o eliminación de la cuenta.
          </p>

          <p><strong>5. Privacidad y Protección de Datos</strong></p>
          <p>
            Workee cumple con la <strong>Ley N.º 25.326</strong> de Protección de Datos Personales 
            de la República Argentina. La información será utilizada únicamente para fines de 
            intermediación laboral y nunca será vendida o cedida a terceros no autorizados. 
            Los datos se almacenan en servidores seguros y se realizan copias de respaldo periódicas. 
            El usuario podrá solicitar la eliminación de su cuenta y datos conforme a la ley vigente.
          </p>

          <p><strong>6. Validación de Empresas</strong></p>
          <p>
            Las empresas deberán acreditar su identidad y autorización para actuar en nombre 
            de la organización. Workee podrá solicitar documentación adicional antes de habilitar la cuenta.
          </p>

          <p><strong>7. Responsabilidades del Usuario</strong></p>
          <p>
            - No intentar vulnerar la seguridad o integridad del sistema.<br>
            - No compartir contenido ofensivo, discriminatorio o ilícito.<br>
            - Mantener actualizados sus datos personales o empresariales.<br>
            - Usar los canales de comunicación con respeto y profesionalismo.
          </p>

          <p><strong>8. Disponibilidad del Servicio</strong></p>
          <p>
            Workee podrá realizar tareas de mantenimiento o mejoras técnicas que afecten 
            temporalmente la disponibilidad del sistema. Aunque se adoptan medidas para asegurar 
            estabilidad, no se garantiza un servicio ininterrumpido.
          </p>

          <p><strong>9. Propiedad Intelectual</strong></p>
          <p>
            Todos los contenidos, diseños, logotipos y desarrollos del sistema son propiedad del 
            equipo desarrollador de Workee. Se prohíbe su copia o modificación sin autorización previa.
          </p>

          <p><strong>10. Modificaciones de los Términos</strong></p>
          <p>
            Workee podrá modificar estos términos en cualquier momento. Las actualizaciones 
            serán notificadas dentro del sistema y el uso continuo implicará su aceptación.
          </p>

          <p><strong>11. Aceptación</strong></p>
          <p>
            Al registrarse o continuar utilizando la plataforma, el usuario declara haber leído, 
            comprendido y aceptado los presentes Términos y Condiciones en su totalidad.
          </p>
        </div>
      `,
      confirmButtonText: 'Aceptar',
      showCloseButton: true,
      focusConfirm: false,
      width: '650px',
      customClass: {
        popup: 'swal2-border-radius',
        confirmButton: 'btn-confirmar'
      }
    });
  }


  onFileSelected($event: any) {
    try {
      this.file = <File>$event.target.files[0];
      this.imgRef = ref(this.storage, `foto/${this.file.name}`);
      this.fotoTemporal = URL.createObjectURL(this.file); // 👈 agrega esta línea

      if (this.file.size > 5242880) {
        this.candidatoForm.get('urlFotoPerfil')?.setErrors({ tamanioInvalido: true });
      } else if (!this.verificarFormato(this.file.name)) {
        this.candidatoForm.get('urlFotoPerfil')?.setErrors({ formato: true });
      } else {
        this.candidatoForm.get('urlFotoPerfil')?.setErrors(null);
      }

    } catch {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Debe seleccionar una foto de perfil',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }
  verificarFormato(nombreArchivo: string): boolean {
    const extensionesPermitidas = /\.(jpg|jpeg|png)$/i;
    return extensionesPermitidas.test(nombreArchivo);
  }


abrirSelectorCV() {
  document.getElementById('fileCV')?.click();
  
}

onCVSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Resetear errores previos
    this.candidatoForm.get('enlaceCV')?.setErrors(null);

    // Validar formato
    if (file.type !== 'application/pdf') {
      this.candidatoForm.get('enlaceCV')?.setErrors({ formato: true });
      this.fileCV = null; // Asegúrate de que fileCV esté nulo si hay un error
      this.changeDetectorRef.detectChanges(); // Forzar la actualización
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.candidatoForm.get('enlaceCV')?.setErrors({ tamanioInvalido: true });
      this.fileCV = null; // Asegúrate de que fileCV esté nulo si hay un error
      this.changeDetectorRef.detectChanges(); // Forzar la actualización
      return;
    }

    // Guardar archivo y generar preview
    this.fileCV = file;
    this.CVTemporal = URL.createObjectURL(file);
    this.candidatoForm.get('enlaceCV')?.setValue(file);
    
    // Forzar la detección de cambios para que la UI se actualice inmediatamente
    this.changeDetectorRef.detectChanges();
  }

  eliminarCV() {
    this.fileCV = null;
    this.CVTemporal = null;
    this.candidatoForm.get('enlaceCV')?.reset();
    
    // Forzar la detección de cambios para que la UI se actualice inmediatamente
    this.changeDetectorRef.detectChanges();
  }
  
}