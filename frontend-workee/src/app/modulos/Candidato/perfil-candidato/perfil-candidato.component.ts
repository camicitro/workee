import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { PaisService } from '../../../admin/ABMPais/pais.service';
import { ProvinciaService } from '../../../admin/ABMProvincia/provincia.service';
import { GeneroService } from '../../../admin/ABMGenero/genero.service';
import { Genero } from '../../../admin/ABMGenero/genero';
import { Pais } from '../../../admin/ABMPais/pais';
import { Provincia } from '../../../admin/ABMProvincia/provincia';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Candidato } from '../../candidato/candidato';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SeleccionHabilidadesComponent } from './seleccion-habilidades/seleccion-habilidades.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatoService } from '../candidato.service';
import { Habilidad } from '../../../admin/ABMHabilidad/habilidad';
import { CandidatoHabilidad } from '../candidato-habilidad';
import { HabilidadService } from '../../../admin/ABMHabilidad/habilidad.service';
import { EstadoBusquedaLaboralService } from '../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral.service';
import { EstadoBusquedaLaboral } from '../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral';
import { UsuarioService } from '../../seguridad/usuarios/usuario.service';
import { ref, StorageReference, Storage, uploadBytes, getDownloadURL, uploadBytesResumable } from '@angular/fire/storage';
import { CambioContraseniaComponent } from '../../../compartidos/cambio-contrasenia/cambio-contrasenia.component';
import { SpinnerService } from '../../../compartidos/spinner/spinner.service';
import { SpinnerComponent } from "../../../compartidos/spinner/spinner/spinner.component";
import { SesionService } from '../../../interceptors/sesion.service';

@Component({
  selector: 'app-perfil-candidato',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './perfil-candidato.component.html',
  styleUrls: ['./perfil-candidato.component.css'],
})
export class PerfilCandidatoComponent implements OnInit {
  //Cuando se demora en cargar cosas del perfil
  cargandoPerfil: boolean = false;


  candidatoForm: FormGroup;
  submitForm: boolean = false;
  modoEdicion: boolean = false;
  verContrasenia: boolean = false;
  mostrarCampoRepetir: boolean = false;
  repetirContrasenia = '';
  candidato: Candidato = {};
  candidatoOriginal: Candidato = {
    id: 0,
    nombreCandidato: '',
    apellidoCandidato: '',
    fechaDeNacimiento: '',
    estadoBusqueda: {
      id: 0,
      nombreEstadoBusqueda: ''
    },
    candidatoCV: {
      id: 0,
      enlaceCV: '',
    },
    genero: {
      id: 0,
      nombreGenero: ''
    },
    provincia: {
      id: 0,
      nombreProvincia: ''
    },
    usuario: {
      id: 0,
      correoUsuario: '',
      contraseniaUsuario: '',
      urlFotoUsuario: '',
    },
    habilidades: []
  }

  fotoTemporal: string = '';
  CVTemporal: any = null;
  
  //PARA FOTO DE PERFIL
  urlFoto = '';
  file!: File;
  imgRef!: StorageReference;
  previewUrl!: string;
  
  cargandoFoto: boolean = false;


  //PARA CV
  private storage = inject(Storage);
  urlCV = '';
  fileCV: any = null;
  docRef!: StorageReference;
  @ViewChild('fileInputCV') fileInputCV!: ElementRef<HTMLInputElement>;
  nombreArchivoCV: string = '';

  cargandoCv: boolean = false;

  modalRef?: NgbModalRef;

  paises: Pais[] =[];
  provincias: Provincia[] = [];
  provinciasDePais: Provincia[] = []; // se usa para mostrar las provincias segun el pais que se selecciono
  generos: Genero[] = [];
  estados: EstadoBusquedaLaboral[] = [];
  habilidades: CandidatoHabilidad[] = [];
  paisSeleccionado?: Pais;
  todasHabilidades: Habilidad[] = []; // todas las habilidades de la BD

  habilidadesSeleccionadasID: number[] = []; // array de ids de las habildiades que le quedaron al candidato
  habilidadesFinales: any;
  habs: CandidatoHabilidad[] = [];

  enlaceCV: string = '';

  constructor(
    private candidatoService: CandidatoService,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private generoService: GeneroService,
    private estadoBusquedaService: EstadoBusquedaLaboralService,
    private habilidadService: HabilidadService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private sesionService: SesionService,
    private router: Router,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef
  ) {
    this.candidatoForm = new FormGroup({
      nombreCandidato: new FormControl('', [Validators.required]),
      apellidoCandidato: new FormControl('', [Validators.required]),
      fechaDeNacimiento: new FormControl('', [Validators.required]),
      provinciaCandidato: new FormControl({ value: null, disabled: true }, [Validators.required]),
      paisCandidato: new FormControl({ value: null, disabled: true }, [Validators.required]),
      estadoBusquedaCandidato: new FormControl(null, [Validators.required]),
      generoCandidato: new FormControl({ value: null, disabled: true }, [Validators.required]),
      habilidadesCandidato: new FormControl(''),
      enlaceCV: new FormControl(''),
      correoCandidato: new FormControl('', [Validators.required, Validators.email]),
      contrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repetirContrasenia: new FormControl('', [Validators.required, Validators.minLength(8)]),
      urlFotoPerfil: new FormControl(''),
    })
  }

  ngOnInit(): void {
    this.cargandoPerfil = true;
    this.provinciaService.findAllActivas().subscribe({
      next: (data) => {
        this.provincias = data;
        
        this.usuarioService.getUsuario().subscribe({
          next: (data) => {
            this.candidato = data;

            this.candidatoOriginal = JSON.parse(JSON.stringify(data));
            console.log(this.candidato)
            this.paisSeleccionado = this.candidato.provincia?.pais;
            this.enlaceCV = this.candidato.candidatoCV?.enlaceCV ?? '';
            // console.log("enlace CV: ", this.enlaceCV)
            this.habs = this.candidato.habilidades!;
            // console.log("habilidades: ", this.habs);
            this.habilidades = this.candidato.habilidades ?? [];
            this.candidatoForm.patchValue({
              nombreCandidato: this.candidato.nombreCandidato,
              apellidoCandidato: this.candidato.apellidoCandidato,
              generoCandidato: this.candidato.genero,
              paisCandidato: this.candidato.provincia?.pais,
              provinciaCandidato: this.candidato.provincia,
              estadoBusquedaCandidato: this.candidato.estadoBusqueda,
            });

            this.filtrarProvinciasPorPais(this.candidato.provincia?.pais ?? null);
          }
        })
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al obtener provincias', error);
      }
    })
    

    this.paisService.findAllActivos().subscribe({
      next: (data) => {
        this.paises = data;
        // console.log(this.paises)
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al obtener paises', error);
      }
    })
    
    this.generoService.findAllActivos().subscribe({
      next: (data) => {
        this.generos = data;
        //console.log(this.generos)
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al obtener generos', error);
      }
    })
    
    this.estadoBusquedaService.findAllActivos().subscribe({
      next: (data) => {
        this.estados = data;
        //console.log(this.generos)
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al obtener estados', error);
      }
    })
      
    this.habilidadService.findAllActivas().subscribe(habilidades => {
      this.todasHabilidades = habilidades;
    });
    // console.log("habilidades desde linea 205: ", this.habilidades)
    this.cargandoPerfil = false;
  }

  modificarCandidato() {
    this.modoEdicion = true;
    this.candidatoForm.get('generoCandidato')?.enable();
    this.candidatoForm.get('paisCandidato')?.enable();
    this.candidatoForm.get('provinciaCandidato')?.enable();
  }

  seleccionarHabilidades() {
  this.modalRef = this.modalService.open(SeleccionHabilidadesComponent, {
    centered: true,
    scrollable: true,
    size: 'lg'
  });

  //this.modalRef.componentInstance.habilidadesSeleccionadas = [...this.habilidades];
  // Clonar profundamente las habilidades seleccionadas para no modificar las originales
  this.modalRef.componentInstance.habilidadesSeleccionadas = JSON.parse(JSON.stringify(this.habilidades));


  this.modalRef.result.then((result: number[] | undefined) => {
    if (result && result.length > 0) {
      this.habilidadesSeleccionadasID = result;

      const habilidadesFinales: CandidatoHabilidad[] = result
        .map(id => {
          const hab = this.todasHabilidades.find(h => h.id === id);
          return hab ? { habilidad: hab, fechaHoraBaja: null } as CandidatoHabilidad : null;
        })
        .filter((x): x is CandidatoHabilidad => !!x);

      this.habilidades = habilidadesFinales;
      this.habilidadesFinales = undefined;

      this.cdr.detectChanges();

      console.log('IDs seleccionadas (perfil):', this.habilidadesSeleccionadasID);
      console.log('Habilidades objeto (perfil):', this.habilidades);
    } else {
      console.log('Modal cerrado sin cambios o resultado vacío');
    }
  }).catch((reason) => {
    console.log('Modal dismissed:', reason);
  });
}

  volver() {
    if (this.modoEdicion) {
      Swal.fire({
        title: "¿Está seguro de que desea volver?",
        text: "Los cambios realizados no se guardarán",
        icon: "question",
        iconColor: "#31A5DD",
        showCancelButton: true,
        confirmButtonColor: "#31A5DD",
        cancelButtonColor: "#697077",
        confirmButtonText: "Sí, volver",
        cancelButtonText: "No, cerrar",
        reverseButtons: true,
        customClass: {
          title: 'titulo-chico',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.fotoTemporal = '';
          this.modoEdicion = false;
          this.candidatoForm.get('generoCandidato')?.disable();
          this.candidatoForm.get('paisCandidato')?.disable();
          this.candidatoForm.get('provinciaCandidato')?.disable();
          this.candidato = JSON.parse(JSON.stringify(this.candidatoOriginal));

        //Restaurar las habilidades originales
        this.habilidades = JSON.parse(JSON.stringify(this.candidatoOriginal.habilidades || []));
        this.habilidadesSeleccionadasID = [];
        this.habilidadesFinales = undefined;

          this.candidatoForm.patchValue({
            nombreCandidato: this.candidato.nombreCandidato,
            apellidoCandidato: this.candidato.apellidoCandidato,
            generoCandidato: this.candidato.genero,
            paisCandidato: this.candidato.provincia?.pais,
            provinciaCandidato: this.candidato.provincia,
            estadoBusquedaCandidato: this.candidato.estadoBusqueda,
          });

          this.filtrarProvinciasPorPais(this.candidato.provincia?.pais ?? null);
      }});
    }
  }

  async enviarDatos() {
    this.submitForm = true;
    Swal.fire({
      title: '¿Desea confirmar los cambios realizados?',
      icon: "question",
      iconColor: "#70DC73",
      showCancelButton: true,
      confirmButtonColor: "#70DC73",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        let habilidadesAEnviar: number[] = [];
        // console.log("habilidades que ya tiene: ", this.candidato.habilidades?.map(habilidad => habilidad.habilidad?.id).filter((id): id is number => id !== undefined))
        if (this.habilidadesSeleccionadasID.length === 0) {
          habilidadesAEnviar = (this.candidato.habilidades?.map(habilidad => habilidad.habilidad?.id).filter((id): id is number => id !== undefined)) || [];
        } else {
          habilidadesAEnviar = this.habilidadesSeleccionadasID;
        }
        const formValue = this.candidatoForm.value;

        let fotoURL = this.candidato.usuario?.urlFotoUsuario ?? '';
        if (this.file) {
          const subida = await this.subirFoto(this.file);
          if (subida) fotoURL = subida;
        }

        const enlaceCV = this.candidato.candidatoCV?.enlaceCV ?? null;

        this.candidatoService.modificarCandidato(this.candidato.id!,
                              formValue.nombreCandidato,
                              formValue.apellidoCandidato,
                              formValue.provinciaCandidato?.id ?? 0,
                              formValue.estadoBusquedaCandidato?.id ?? 0,
                              formValue.generoCandidato?.id ?? 0,
                              habilidadesAEnviar,
                              fotoURL,
                              enlaceCV ?? '',
        ).subscribe({
          next: () => {
            this.candidato.habilidades = this.habilidades || [];

            this.candidato.estadoBusqueda = formValue.estadoBusquedaCandidato;
            this.candidatoOriginal = JSON.parse(JSON.stringify(this.candidato));
            this.modoEdicion = false;
            this.candidatoForm.get('generoCandidato')?.disable();
            this.candidatoForm.get('paisCandidato')?.disable();
            this.candidatoForm.get('provinciaCandidato')?.disable();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El perfil se modificó correctamente",
              timer: 3000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al modificar candidato', error);
            if(error.error.message === "Las contraseñas deben coincidir") {
              Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'Las contraseñas no coinciden',
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
              });
            }
            if(error.error.message === "La contraseña debe tener al menos 8 caracteres") {
              Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'La contraseña debe tener al menos 8 caracteres',
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
              });
          }
        }
      })
    }});
  }

  compararGenero = (g1: Genero, g2: Genero) => g1 && g2 ? g1.id === g2.id : g1 === g2;
  
  compararPais = (p1: Pais, p2: Pais) => p1 && p2 ? p1.id === p2.id : p1 === p2;
  
  compararProvincia = (p1: Provincia, p2: Provincia) => p1 && p2 ? p1.id === p2.id : p1 === p2;
  
  compararEstadoBusqueda = (e1: EstadoBusquedaLaboral, e2: EstadoBusquedaLaboral) => e1 && e2 ? e1.id === e2.id : e1 === e2;

  formatearFecha(fechaStr: string | undefined): string {
    if (!fechaStr) return '';

    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  filtrarProvinciasPorPais(paisSeleccionado: Pais | null) {
    // console.log("pais seleccionado: ", paisSeleccionado);
    this.paisSeleccionado = paisSeleccionado!;
    
    if (!paisSeleccionado) {
      this.provinciasDePais = [];
      this.candidato.provincia = undefined; // limpiar si no hay país seleccionado
      return;
    }

    this.provinciasDePais = this.provincias.filter(
      provincia => provincia.pais?.id === paisSeleccionado.id
    );

    const provinciaValida = this.provinciasDePais.find(p => p.id === this.candidato.provincia?.id);
    if (!provinciaValida) {
      this.candidato.provincia = undefined;
    }
  }

  get habilidadesParaMostrar(): CandidatoHabilidad[] {
    // console.log(this.habilidadesFinales);
    return this.habilidadesFinales === undefined ? this.habilidades : this.habilidadesFinales;
  }

  mostrarNombreArchivoCV(enlace: string | undefined): string { 
    if (!enlace) return '';
    try {
      const start = enlace.indexOf('/o/');
      const mid = enlace.indexOf('?', start);
      if (start === -1) return enlace;

      let nombreEnc = enlace.substring(start + 3, mid !== -1 ? mid : enlace.length);
      let nombreDec = decodeURIComponent(nombreEnc);

      const partes = nombreDec.split('/');
      return partes[partes.length - 1];
    } catch {
      return enlace;
    }
  }

  onFileSelectedFoto(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.file = file;
      const reader = new FileReader();
      reader.onload = e => this.fotoTemporal = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  async subirFoto(file: File): Promise<string | null> {
    if (!file) return null;
    try {
      this.cargandoFoto = true;
      
      const filePath = `foto/${file.name}`;
      const fileRef = ref(this.storage, filePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      this.cargandoFoto = false;
      
      return downloadURL;
    } catch (error) {
      this.cargandoFoto = false;
      console.error("Error al subir la foto:", error);
      return null;
    }
  }

  verificarFormatoFoto(nombreArchivo: string): boolean {
    const extensionesPermitidas = /\.(jpg|jpeg|png)$/i;
    return extensionesPermitidas.test(nombreArchivo);
  }
  
  onFileSelectedCV(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        Swal.fire({
          icon: 'error',
          title: 'El CV debe estar en formato PDF',
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
        this.fileInputCV.nativeElement.value = '';
        return;
      }
      const maxSize = 5 //* 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'warning',
          title: 'El archivo debe ser menor a 5 MB',
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
        this.fileInputCV.nativeElement.value = '';
        return;
      }
      this.subirCV(file);
    }
  }

  async subirCV(file: File) {
    if (!file) return;
    try {
      this.cargandoCv = true;
      console.log("entre al try")
      const filePath = `cv/${file.name}`;
      const fileRef = ref(this.storage, filePath);

      const snapshot = await uploadBytes(fileRef, file);

      const downloadURL = await getDownloadURL(fileRef);

      this.candidato.candidatoCV = {
        enlaceCV: downloadURL,
        fechaHoraAlta: new Date().toISOString(),
        fechaHoraBaja: null
      };

      this.candidato = {
        ...this.candidato,
        candidatoCV: { ...this.candidato.candidatoCV }
      };

      this.candidatoForm.patchValue({
        enlaceCV: downloadURL
      });

      this.candidatoService.actualizarCV(
        this.candidato.id!,
        this.candidato.candidatoCV!.enlaceCV ?? ''
      ).subscribe({
        next: () => {
          this.cargandoCv = false;
          console.log("genial, ya cambie el cv, el candidatoCV nuevo es:", this.candidato.candidatoCV)
          // this.candidato = { ...this.candidato, candidatoCV: this.candidato.candidatoCV };
          // this.usuarioService.getUsuario().subscribe(candidatoActualizado => {
          //   this.candidato = candidatoActualizado;
          // });

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "CV subido correctamente",
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          this.cargandoCv = false;
          console.error("Error al guardar CV en BD:", err);
        }
      });
    } catch (error) {
      this.cargandoCv = false;
      console.error("Error al subir el CV:", error);
    }
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.candidatoForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }

  eliminarCV() {
    Swal.fire({
      title: "¿Desea eliminar su CV?",
      text: "Esta acción no se puede deshacer.",
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log("Elimino CV");
        this.candidatoService.eliminarCV(this.candidato.id!).subscribe({
          next: () => {
            this.candidato.candidatoCV = undefined;
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El CV se eliminó correctamente",
              timer: 3000,
              showConfirmButton: false,
            });
        },
        error: (error) => {
          console.error('Error al eliminar CV', error); 
        },
        });
      }
    });
  }

  abrirModalContrasenia() {
    this.modalRef = this.modalService.open(CambioContraseniaComponent, {
      centered: true,
      scrollable: true,
      size: 'md'
    });

    this.modalRef.componentInstance.usuarioId = this.candidato.usuario!.id;
  }

  eliminarCuenta() {
    Swal.fire({
      title: '¿Desea eliminar su cuenta?',
      text: 'Esta acción no se puede deshacer, su cuenta será eliminada permanentemente',
      icon: "error",
      iconColor: "#FF5252",
      showCancelButton: true,
      confirmButtonColor: "#FF5252",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, volver",
      reverseButtons: true, 
      customClass: {
        title: 'titulo-chico',
    }})
  .then((result) => {
    if (result.isConfirmed) {
      this.candidatoService.eliminarCuenta(this.candidato.id!).
      subscribe({
        next: () => {
          this.modoEdicion = false;
          // this.volver();
          this.sesionService.logout()
          // // TODO: QUE PONEMOS ACA?
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Tu cuenta ha sido eliminada exitosamente",
            timer: 3000,
            showConfirmButton: false,
          })
          this.router.navigate([`login`])
        }
      })
    }});
  }
}
