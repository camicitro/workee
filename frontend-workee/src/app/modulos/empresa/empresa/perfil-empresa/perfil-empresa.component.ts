import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresaService } from '../empresa.service';
import { Empresa } from '../empresa';
import { RubroService } from '../../../../admin/ABMRubro/rubro.service';
import { ProvinciaService } from '../../../../admin/ABMProvincia/provincia.service';
import { Rubro } from '../../../../admin/ABMRubro/rubro';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { CambioContraseniaComponent } from '../../../../compartidos/cambio-contrasenia/cambio-contrasenia.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { ref, StorageReference, Storage, uploadBytes, getDownloadURL, uploadBytesResumable } from '@angular/fire/storage';
import { SpinnerComponent } from "../../../../compartidos/spinner/spinner/spinner.component";
import { SesionService } from '../../../../interceptors/sesion.service';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent],
  selector: 'app-visualizar-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent implements OnInit {
  //para spinner si todavia no carga
  cargandoPerfil: boolean = false;

  empresa: Empresa = {};
  idEmpresa = 0;
  empresaOriginal: Empresa = {
    id: 0,
    nombreEmpresa: '',
    descripcionEmpresa: '',
    numeroIdentificacionFiscal: '',
    telefonoEmpresa: 0,
    emailEmpresa: '',
    direccionEmpresa: '',
    sitioWebEmpresa: '',
    usuario: {
      id: 0,
      correoUsuario: '',
      contraseniaUsuario: '',
      urlFotoUsuario: '',
    }
  };
  modoEdicion = false;
  rubros: Rubro[] = [];

  repetirContrasenia = '';
  idProvincia? = 0;
  nombrePais? = '';

  empresaForm: FormGroup;
  submitForm: boolean = false;

  modalRef?: NgbModalRef;

  private storage = inject(Storage);
  fotoTemporal: string = '';
  file!: File;
  imgRef!: StorageReference;

  cargandoFoto: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private router: Router,
    private rubroService: RubroService,
    private usuarioService: UsuarioService,
    private modalService: ModalService,
    private sesionService: SesionService
  ) {
    this.empresaForm = new FormGroup({
      nombreEmpresa: new FormControl('', [Validators.required]),
      descripcionEmpresa: new FormControl('', [Validators.required]),
      telefonoEmpresa: new FormControl('', [Validators.required]),
      direccionEmpresa: new FormControl('', [Validators.required,]),
      // urlFotoPerfil: new FormControl(''),
      rubroEmpresa: new FormControl({ value: null, disabled: true }, [Validators.required]),
      sitioWebEmpresa: new FormControl(''),
    })
  }

  ngOnInit(): void {
    this.cargandoPerfil = true;
    this.usuarioService.getUsuario().subscribe({
      next: (data) => {
        this.empresa = data;
        console.log(this.empresa);
        this.empresaOriginal = JSON.parse(JSON.stringify(data));
        this.idProvincia = this.empresa.provincia?.id;
        console.log("el id de la provincia es ", this.idProvincia)
        this.idEmpresa = this.empresa.id ?? 0;

        this.empresaForm.patchValue({
          nombreEmpresa: this.empresa.nombreEmpresa,
          descripcionEmpresa: this.empresa.descripcionEmpresa,
          telefonoEmpresa: this.empresa.telefonoEmpresa,
          direccionEmpresa: this.empresa.direccionEmpresa,
          // urlFotoPerfil: this.empresa.usuario?.urlFotoUsuario,
          rubroEmpresa: this.empresa.rubro,
          sitioWebEmpresa: this.empresa.sitioWebEmpresa
        });
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al obtener empresa', error);
      }
    })
    this.cargandoPerfil = false;
    this.rubroService.findAllActivos().subscribe({
      next: (data) => {
        this.rubros = data;
      },
      error: (error) => {
        console.error('Error al obtener rubros', error);
      }
    })
  }

  modificarEmpresa() {
    this.modoEdicion = true;
    this.empresaForm.get('rubroEmpresa')?.enable();
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

      const filePath = `logo/${file.name}`;
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

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.empresaForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }

  eliminarCuenta() {
    Swal.fire({
      title: '¿Desea eliminar su cuenta?',
      text: 'Esta acción no se puede deshacer, su cuenta  será eliminada permanentemente',
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
      this.empresaService.eliminarEmpresa(this.idEmpresa).
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
            title: "La empresa ha sido eliminada exitosamente.",
            timer: 3000,
            showConfirmButton: false,
          })
          this.router.navigate([`login`])    
        },
        error: (error) => {
          console.error('Error al eliminar la cuenta', error)
          if(error.error.message === "Empleado asociado a una etapa de oferta") {
            // TODO: CAMBIAR MESSAGE DE ERROR SEGUN EL ERROR QUE SE AGREGUE EN EL BACK
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "warning",
              title: "¡El empleado está asociado a una etapa actualmente!",
              text: "No se puede eliminar un empleado que está asignado a una etapa en una oferta no finalizada",
              timer: 3000,
              showConfirmButton: false,
            })
            }
        }
      })
    }});
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
        const formValue = this.empresaForm.value;
        
        let fotoURL = this.empresa.usuario?.urlFotoUsuario ?? '';
        if (this.file) {
          const subida = await this.subirFoto(this.file);
          if (subida) fotoURL = subida;
        }

        this.empresaService.modificarEmpresa(this.empresa.id!,
                                            formValue.nombreEmpresa,
                                            formValue.descripcionEmpresa,
                                            formValue.rubroEmpresa.id,
                                            formValue.telefonoEmpresa,
                                            formValue.direccionEmpresa,
                                            formValue.sitioWebEmpresa,
                                            fotoURL
        ).subscribe({
          next: () => {
            this.empresaOriginal = JSON.parse(JSON.stringify(this.empresa));
            this.modoEdicion = false;
            this.empresaForm.get('rubroEmpresa')?.disable();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El perfil de la empresa se modificó correctamente",
              timer: 3000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al modificar empresa', error);
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
            
            
          
              // TODO: agregar algun msj de error cuando no se envia? por ejemplo si ingrsa 
            // un string en el telefono no se va a enviar, pero no se si vale la pena hacer
            // esa validacion por ejemploy mostrar de que no se envio por eso 
          }
        })
    }});
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
          this.empresa = JSON.parse(JSON.stringify(this.empresaOriginal));
          this.empresaForm.get('rubroEmpresa')?.disable();
          this.modoEdicion = false;
          this.empresaForm.patchValue({
            nombreEmpresa: this.empresa.nombreEmpresa,
            descripcionEmpresa: this.empresa.descripcionEmpresa,
            telefonoEmpresa: this.empresa.telefonoEmpresa,
            direccionEmpresa: this.empresa.direccionEmpresa,
            // urlFotoPerfil: this.empresa.usuario?.urlFotoUsuario,
            rubroEmpresa: this.empresa.rubro,
            sitioWebEmpresa: this.empresa.sitioWebEmpresa
          });
      }});
    }
  }

  compararRubros = (r1: Rubro, r2: Rubro): boolean => {
    return r1 && r2 ? r1.id === r2.id : r1 === r2;
  };

  abrirModalContrasenia() {
    this.modalRef = this.modalService.open(CambioContraseniaComponent, {
      centered: true,
      scrollable: true,
      size: 'md'
    });

    this.modalRef.componentInstance.usuarioId = this.empresa.usuario!.id;
  }
}