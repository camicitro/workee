import { Component, inject, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { EmpleadoService } from '../empleado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Empleado } from '../empleado';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CambioContraseniaComponent } from '../../../../compartidos/cambio-contrasenia/cambio-contrasenia.component';
import { SesionService } from '../../../../interceptors/sesion.service';
import { RolService } from '../../../seguridad/usuarios/rol.service';
import { ref, StorageReference, Storage, uploadBytes, getDownloadURL, uploadBytesResumable } from '@angular/fire/storage';
import { EmpresaService } from '../../empresa/empresa.service';
import { SpinnerComponent } from "../../../../compartidos/spinner/spinner/spinner.component";
import { CommonModule } from '@angular/common';
import { OfertaService } from '../../../oferta/oferta.service';
import { EmpleadoEtapaDTO } from './empleado-etapa-dto';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-perfil-empleado',
  imports: [FormsModule, SpinnerComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-empleado.component.html',
  styleUrl: './perfil-empleado.component.css'
})
export class PerfilEmpleadoComponent implements OnInit, OnDestroy {
  //para spinner de carga del perfil
  cargandoPerfil: boolean = false;

  empleadoHabilitado: boolean = false;

  empleado: Empleado = {
    id: 0,
    nombreEmpleadoEmpresa: '',
    apellidoEmpleadoEmpresa: '',
    puestoEmpleadoEmpresa: '',
    usuario: {
      id: 0,
      correoUsuario: '',
      contraseniaUsuario: '',
      urlFotoUsuario: '',
    }
  };

  empleadoForm: FormGroup;

  puestoOriginal: string = ''; // en esta variable se guarda el puesto original del empleado recibido desde la BD, sin ningun cambio
  idEmpleado!: number;
  modoEdicion = false;
  
  // CON ESTA VARIABLE, la idea es que cuando se trate del usuario empleado, aparezcan los campos que el mismo puede editar (no el admin)
  // si el empleado ha ingresado en su perfil, esta variable esta en true
  // @Input() esEmpleado: boolean = true;
  esEmpleado!: boolean;
  verContrasenia: boolean = false;
  mostrarCampoRepetir: boolean = false;
  repetirContrasenia: string = '';

  idEmpresaObtenida!: number;

  modalRef?: NgbModalRef;
  
  //PARA FOTO DE PERFIL
  urlFoto = '';
  file!: File;
  imgRef!: StorageReference;
  previewUrl!: string;
  fotoTemporal: string = '';
  private storage = inject(Storage);

  cargandoFoto: boolean = false;
  etapasEmpleado?: EmpleadoEtapaDTO[] = [];
  submitForm: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private empleadoService: EmpleadoService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private modalService: ModalService,
    private rolService: RolService,
    private sesionService: SesionService,
    private empresaService: EmpresaService,
    private ofertaService: OfertaService) {
      this.empleadoForm = new FormGroup({
        nombreEmpleado: new FormControl('', [Validators.required]),
        apellidoEmpleado: new FormControl('', [Validators.required]),
        puestoEmpleado: new FormControl('', [Validators.required]),
      })
    }

  ngOnInit(): void {
    this.sesionService.rolUsuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rol => {
        if (rol) {
          this.cargarPerfil(rol);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPerfil(rol: any): void {
    if (rol.codigoRol === 'EMPLEADO_EMPRESA') {
      this.esEmpleado = true;

      this.usuarioService.getUsuario().subscribe({
        next: (data) => {
          this.empleado = data;
          this.empleadoForm.patchValue({
            nombreEmpleado: this.empleado.nombreEmpleadoEmpresa,
            apellidoEmpleado: this.empleado.apellidoEmpleadoEmpresa,
            puestoEmpleado: this.empleado.puestoEmpleadoEmpresa,
          });
          this.cargandoPerfil = false;
        },
        error: (err) => {
          this.cargandoPerfil = false;
          console.error('Error al obtener el empleado desde usuarioService', err);
        }
      });

    } else {
      this.esEmpleado = false;
      const id = Number(this.route.snapshot.paramMap.get('idEmpleado'));
      this.idEmpleado = id;

      this.empresaService.getidEmpresabyCorreo()?.subscribe({
        next: (idEmpresa) => {
          if (idEmpresa !== undefined && idEmpresa !== null) {
            this.idEmpresaObtenida = idEmpresa;
            console.log('id empresa obtenido desde el perfil : ', idEmpresa);
          }
        },
        error: (err) => {
          this.cargandoPerfil = false;
          console.error('Error al obtener id de empresa por correo', err);
        }
      });

      this.empleadoService.findById(id).subscribe({
        next: (data) => {
          this.empleado = { ...data };
          this.empleadoHabilitado = this.empleado.fechaHoraBaja === null;

          this.empleadoForm.patchValue({
            nombreEmpleado: this.empleado.nombreEmpleadoEmpresa,
            apellidoEmpleado: this.empleado.apellidoEmpleadoEmpresa,
            puestoEmpleado: this.empleado.puestoEmpleadoEmpresa,
          });

          this.puestoOriginal = data.puestoEmpleadoEmpresa ?? '';

          this.ofertaService.getEtapasPorEmpleado(this.empleado.id!).subscribe({
            next: (data) => {
              this.etapasEmpleado = data;
              this.cargandoPerfil = false;
            },
            error: (err) => {
              this.cargandoPerfil = false;
              console.error('Error al obtener etapas del empleado', err);
            }
          });
        },
        error: (error) => {
          this.cargandoPerfil = false;
          console.error('Error al obtener el empleado', error);
        }
      });
    }
  }

  modificarEmpleado() {
    this.modoEdicion = true;
    this.puestoOriginal = this.empleado.puestoEmpleadoEmpresa ?? '';
  }

  volverAListado() {
    // con esta funcion, si esta en modo edicion, el boton "Volver" lo vuelve al perfil sin editar,
    // si no esta en modo edicion, vuelve al listado completo de todos los empleados
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
          // this.empleado.puestoEmpleadoEmpresa = this.puestoOriginal;
          this.modoEdicion = false;
          this.empleadoForm.patchValue({
            nombreEmpleado: this.empleado.nombreEmpleadoEmpresa,
            apellidoEmpleado: this.empleado.apellidoEmpleadoEmpresa,
            puestoEmpleado: this.empleado.puestoEmpleadoEmpresa,
          })
      }});
    } else {
      this.router.navigate([`empleados`]);
    }
  }

  async enviarDatos() {
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
        const nuevoPuesto = this.empleado.puestoEmpleadoEmpresa;
        const formValue = this.empleadoForm.value;
        if (!this.esEmpleado) {
          // El administrador es quien esta modificando el perfil del empleado
          this.empleadoService.modificarEmpleadoComoEmpresa(formValue.puestoEmpleado, this.empleado.id!, this.idEmpresaObtenida).subscribe({
            next: () => {
              this.puestoOriginal = nuevoPuesto ?? '';
              this.modoEdicion = false;
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "La cuenta del empleado se modificó correctamente",
                timer: 3000,
                showConfirmButton: false,
              });
            },
            error: (error) => {
              console.error('Error al modificar empleado', error);
            }
          })
        } else {

          let fotoURL = this.empleado.usuario?.urlFotoUsuario ?? '';
          if (this.file) {
            const subida = await this.subirFoto(this.file);
            if (subida) fotoURL = subida;
          }
          console.log("desde el perfil, esto voy a mandar: ", this.empleado.id!)
          this.empleadoService.modificarEmpleadoComoEmpleado(
          formValue.nombreEmpleado,
          formValue.apellidoEmpleado,
          this.empleado.id!,
          this.empleado.empresa?.id ?? 0,
          fotoURL
        ).subscribe({
          next: () => {
            console.log("pude mandar bien la request")
            this.puestoOriginal = nuevoPuesto ?? '';
            this.modoEdicion = false;
            this.repetirContrasenia = '';
            this.mostrarCampoRepetir = false;
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Tu perfil ha sido actualizado correctamente",
              timer: 3000,
              showConfirmButton: false,
            });
            
          },
          error: (error) => console.error('Error al modificar empleado', error)
          });
        }
        }
      });
  }

  eliminarCuenta() {
    Swal.fire({
      title: '¿Desea deshabilitar al empleado?',
      text: 'El empleado no podrá acceder al sistema ni participar en las ofertas.',
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.empleadoService.eliminarEmpleado(this.idEmpleado).subscribe({
          next: () => {
            this.modoEdicion = false;
            this.volverAListado();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El empleado ha sido deshabilitado exitosamente.",
              timer: 3000,
              showConfirmButton: false,
            })
          },
          error: (error) => {
            console.error('Error al deshabilitar empleado', error);
            if(error.error.message === "Un error inesperado ha ocurrido: No se puede dar de baja: el empleado participa en ofertas no finalizadas.") {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "¡El empleado está asociado a una oferta actualmente!",
                text: "No se puede eliminar un empleado que está asignado a una etapa en una oferta no finalizada",
                timer: 3000,
                showConfirmButton: false,
              })
            }
          }
        })
    }});
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

  abrirModalContrasenia() {
    this.modalRef = this.modalService.open(CambioContraseniaComponent, {
      centered: true,
      scrollable: true,
      size: 'md'
    });

    this.modalRef.componentInstance.usuarioId = this.empleado.usuario!.id;
  }

  estadoClase(oferta: EmpleadoEtapaDTO): string {
    const cod = (oferta?.estadoOferta ?? '').toUpperCase();
    switch (cod) {
      case 'ABIERTA':     return 'is-abierta';
      case 'CERRADA':     return 'is-cerrada';
      case 'FINALIZADA':  return 'is-finalizada';
      default:            return 'is-neutro';
    }
  }

  estadoTexto(oferta: EmpleadoEtapaDTO): string {
    return oferta?.estadoOferta ?? 'Sin estado';
  }

  irADetalle(id: number) {
    this.router.navigate(['/visualizar-oferta', id]);
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.empleadoForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }

  habilitarEmpleado() {
    Swal.fire({
      title: '¿Desea habilitar a este empleado?',
      text: 'El empleado podrá acceder al sistema nuevamente.',
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.empleadoService.habilitarEmpleado(this.idEmpleado).subscribe({
          next: () => {
            this.modoEdicion = false;
            this.empleadoHabilitado = true; // Actualiza el estado local
            // Actualizar la entidad en memoria para reflejar el cambio en la UI
            this.empleado.fechaHoraBaja = null; 
            this.volverAListado();

            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El empleado ha sido habilitado exitosamente.",
              timer: 3000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al habilitar empleado', error);
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "error",
              title: "Error al habilitar",
              text: "No se pudo completar la acción. Intente más tarde.",
              timer: 3000,
              showConfirmButton: false,
            });
          }
        });
      }
    });
  }

}
