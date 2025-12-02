import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // CORREGIDO: antes estaba mal con 'express'
import { CommonModule } from '@angular/common'; // <-- necesario para *ngIf, ngClass, etc
import { registroserviceempresa } from './registro.service';
import { PaisService } from '../../../../admin/ABMPais/pais.service';
import { ProvinciaService } from '../../../../admin/ABMProvincia/provincia.service';
import { RubroService } from '../../../../admin/ABMRubro/rubro.service';
import { Pais } from '../../../../admin/ABMPais/pais';
import { Provincia } from '../../../../admin/ABMProvincia/provincia';
import { Rubro } from '../../../../admin/ABMRubro/rubro';
import { FormsModule } from '@angular/forms';
//import { EmpresaService } from '../../../empresa/empresa/empresa.service';
import Swal from 'sweetalert2';
import { dir } from 'console';
import { AuthService } from '../../auth.service';
import { Storage, ref, uploadBytes, getDownloadURL, StorageReference} from '@angular/fire/storage';
import { SpinnerComponent } from "../../../../compartidos/spinner/spinner/spinner.component";


@Component({
  selector: 'app-registro-empresa',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpinnerComponent],
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent implements OnInit{
  isLoading: boolean = false;


  empresaForm: FormGroup;
  submitForm: boolean = false;
  backendEmailInvalido = false;
  verContrasenia: boolean = false;
  backendContraseniaCorta = false;
  backendContraseniasNoCoinciden = false;
  numeropaginaregistro: number = 1;
  logoTemporal: string = '';
  documentoLegalTemporal: any = null;

  paises: Pais[] =[];
  provincias: Provincia[] = [];
  provinciasDePais: Provincia[] = [];
  rubros: Rubro[] = [];
  paisSeleccionado?: Pais;
  provinciaSeleccionada?: Provincia;
  rubroSeleccionado?: Rubro;
  today: Date = new Date();


    //PARA LOGO DE EMPRESA
    urlLogo = '';
    file!: File;
    imgRef!: StorageReference;
  
    //PARA DOCUMENTO LEGAL
    urlDocumentoLegal = '';
    fileDocumentoLegal: any = null;
    docRef!: StorageReference;

constructor(

    private router: Router,
    private registroservice: registroserviceempresa,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private rubroService: RubroService,
    private authService: AuthService,
    private storage: Storage,   
    private changeDetectorRef: ChangeDetectorRef

  ) {

    this.empresaForm = new FormGroup({
      nombreEmpresa: new FormControl('', [Validators.required]),
      descripcionEmpresa: new FormControl('', [Validators.required]),
      telefonoEmpresa: new FormControl('', [Validators.required]),
      direccionEmpresa: new FormControl('', [Validators.required,]),
      numeroIdentificacionFiscal: new FormControl('', [Validators.required, Validators.minLength(8)]),
      urlFotoPerfil: new FormControl(''),
      urlDocumentoLegal: new FormControl(''),
      rubroEmpresa: new FormControl(null, [Validators.required]),
      sitioWebEmpresa: new FormControl(''),
      emailEmpresa: new FormControl('', [Validators.required, Validators.email]),
      contrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repetirContrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
      paisEmpresa: new FormControl(null, Validators.required),
      provinciaEmpresa: new FormControl(null, Validators.required),
      terminosCondiciones: new FormControl(false, [Validators.requiredTrue]),
    })
  }

  //SE EJECUTA DSP DEL CONSTRUCTOR
  
  ngOnInit(): void {

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

    console.time('Carga rubros');
    this.rubroService.findAllActivos().subscribe({
      next: (data) => {
        this.rubros = data;
        // console.log(this.provincias)
      },
      error: (error) => {
        console.error('Error al obtener rubros', error);
      }
    })
    
  }


  
  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.empresaForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }


  async enviarDatos() {

    this.backendEmailInvalido = false;
    this.submitForm = true;

    if (this.empresaForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete todos los campos obligatorios y acepte los Términos y Condiciones.',
      });
      return;
    }
    
    const nombreEmpresa  = this.empresaForm.get('nombreEmpresa')?.value;
    const descripcionEmpresa = this.empresaForm.get('descripcionEmpresa')?.value;
    const telefonoEmpresa = this.empresaForm.get('telefonoEmpresa')?.value;
    const direccionEmpresa = this.empresaForm.get('direccionEmpresa')?.value;
    const numeroIdentificacionFiscal = this.empresaForm.get('numeroIdentificacionFiscal')?.value;
    const emailEmpresa = this.empresaForm.get('emailEmpresa')?.value;
    const contrasenia = this.empresaForm.get('contrasenia')?.value;
    const repetirContrasenia = this.empresaForm.get('repetirContrasenia')?.value;
    // const urlFotoPerfil = 'https://github.com'; //CAMBIAR
    // const urlDocumentoLegal = this.empresaForm.get('urlDocumentoLegal')?.value;
    const sitioWebEmpresa = this.empresaForm.get('sitioWebEmpresa')?.value; 
    const rubroSeleccionado = this.empresaForm.get('rubroEmpresa')?.value.id;
    const provinciaSeleccionada = this.empresaForm.get('provinciaEmpresa')?.value.id;

    console.log('Datos enviados');

    if (contrasenia !== repetirContrasenia) {
      this.backendContraseniasNoCoinciden = true;
      this.empresaForm.get('contrasenia')?.setErrors({ backend: true });
      this.empresaForm.get('repetirContrasenia')?.setErrors({ backend: true });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Las contraseñas no coinciden",
        timer: 3000,
        showConfirmButton: false,
      });
      return; // detener el submit
    }

    try {
      this.isLoading = true;

    let urlFotoPerfil = '';
    let urlDocumentoLegal = '';

    // Subir la imagen si existe
    if (this.file) {
      this.imgRef = ref(this.storage, `logo/${this.file.name}`);
      const snapshot = await uploadBytes(this.imgRef, this.file);
      urlFotoPerfil = await getDownloadURL(snapshot.ref);
    }

    if (this.fileDocumentoLegal) {
      this.docRef = ref(this.storage, `documento/${this.fileDocumentoLegal.name}`);
      const snapshot = await uploadBytes(this.docRef, this.fileDocumentoLegal);
      urlDocumentoLegal = await getDownloadURL(snapshot.ref);
    }


this.authService.registrarEmpresa(
  nombreEmpresa,
  descripcionEmpresa,
  telefonoEmpresa,
  direccionEmpresa,
  rubroSeleccionado,
  numeroIdentificacionFiscal,
  emailEmpresa,
  contrasenia,
  repetirContrasenia,
  provinciaSeleccionada,
  urlFotoPerfil,
  urlDocumentoLegal,
  sitioWebEmpresa
).subscribe({
  next: () => {
    this.isLoading = false;
    this.submitForm = true;
    setTimeout(() => {
      this.router.navigate(['/login']); 
    }, 100);
    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "Tu empresa fue registrada correctamente. El administrador revisará tu solicitud para habilitar tu cuenta.",
      showCloseButton: true,
      showConfirmButton: false,
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
        })
      }
      if (error.status === 400 && error.error.message === "Debe ser un correo válido") {
        this.backendEmailInvalido = true;
        this.empresaForm.get('emailEmpresa')?.setErrors({ backend: true });
      } else if (error.status === 400 && error.error.message === "La contraseña debe tener al menos 8 caracteres") {
        this.backendContraseniaCorta = true;
        this.empresaForm.get('contrasenia')?.setErrors({ backend: true });
      }
    }
  });    
    }catch (error) {
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


  compararPais = (p1: Pais, p2: Pais) => p1 && p2 ? p1.id === p2.id : p1 === p2;
  compararProvincia = (p1: Provincia, p2: Provincia) => p1 && p2 ? p1.id === p2.id : p1 === p2;
  compararRubro = (r1: Rubro, r2: Rubro) => r1 && r2 ? r1.id === r2.id : r1 === r2;



  filtrarProvinciasPorPais(paisSeleccionado: Pais | null) {
    if (!paisSeleccionado) {
      this.provinciasDePais = [];
      const pais = this.empresaForm.get('paisEmpresa')?.value;
      return;
    }

    this.provinciasDePais = this.provincias.filter(
      provincia => provincia.pais?.id === paisSeleccionado.id
    );

    this.paisSeleccionado = paisSeleccionado;

    // if (!this.provinciasDePais.some(p => p.id === this.candidato.provincia?.id)) {
    //   this.candidato.provincia = undefined;
    // }
  }

  siguientepagina() {
    this.numeropaginaregistro++;}

  paginaAnterior() {
    this.numeropaginaregistro--;}

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
      this.logoTemporal = URL.createObjectURL(this.file); 

      if (this.file.size > 5242880) {
        this.empresaForm.get('urlFotoPerfil')?.setErrors({ tamanioInvalido: true });
      } else if (!this.verificarFormato(this.file.name)) {
        this.empresaForm.get('urlFotoPerfil')?.setErrors({ formato: true });
      } else {
        this.empresaForm.get('urlFotoPerfil')?.setErrors(null);
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


abrirSelectorDocumentoLegal() {
  document.getElementById('fileDocumentoLegal')?.click();
  
}

onDocumentoLegalSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // Resetear errores previos
  this.empresaForm.get('urlDocumentoLegal')?.setErrors(null);

  // Validar formato por extensión
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    this.empresaForm.get('urlDocumentoLegal')?.setErrors({ formato: true });
    this.fileDocumentoLegal = null;
    this.changeDetectorRef.detectChanges();
    return;
  }

  // Validar tamaño
  if (file.size > 5 * 1024 * 1024) {
    this.empresaForm.get('urlDocumentoLegal')?.setErrors({ tamanioInvalido: true });
    this.fileDocumentoLegal = null;
    this.changeDetectorRef.detectChanges();
    return;
  }

  // Guardar archivo y preview
  this.fileDocumentoLegal = file;
  this.documentoLegalTemporal = URL.createObjectURL(file);
  this.empresaForm.get('urlDocumentoLegal')?.setValue(file);
  this.empresaForm.get('urlDocumentoLegal')?.markAsTouched();

  this.changeDetectorRef.detectChanges();
}


  eliminarDocumentoLegal() {
    this.fileDocumentoLegal = null;
    this.documentoLegalTemporal = null;
    this.empresaForm.get('urlDocumentoLegal')?.reset();
    
    // Forzar la detección de cambios para que la UI se actualice inmediatamente
    this.changeDetectorRef.detectChanges();
  }


}
