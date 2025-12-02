import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RolService } from '../../../rol.service';
import { Rol } from '../../../../rol';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../../compartidos/modal/modal.service';
import { UsuarioService } from '../../../usuario.service';
import { UsuarioListadoDTO } from '../../usuario-listado-dto';


@Component({
  selector: 'app-modificar-rol-usuario',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modificar-rol-usuario.component.html',
  styleUrl: './modificar-rol-usuario.component.css'
})
export class ModificarRolUsuarioComponent implements OnInit {

  // modalRef?: NgbModalRef;
  @Input() idUsuario: number = 0;
  @Input() usuario: UsuarioListadoDTO = {};
  @Input() modalRef!: NgbModalRef;

  rolActual: string = '';
  rolSeleccionado: number | null = null;

  // uso esta variable para obtener la categoria del rol que tiene el usuario
  categoriaRolUsuario: number = 0;

  roles: Rol[] = [];
  
  constructor(
    private rolService: RolService,
    private modalService: ModalService,
    private usuarioService: UsuarioService,
    public activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    console.log("el usuario es: ", this.usuario)

    this.rolService.findByCategoria(this.usuario.idCategoria!).subscribe({
      next: data => {
        this.roles = data;

        const actual = this.roles.find(
          r => r.nombreRol === this.usuario.rolActualusuario
        );

        this.rolSeleccionado = actual?.id ?? null;
      },
      error: err => {
        console.error('Error al cargar roles por categoría', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar los roles',
          text: 'No se pudieron obtener los roles del sistema. Intente nuevamente más tarde.',
          confirmButtonColor: '#FF5252'
        });
      }
    });
  }

  volverAPerfil() {
    if (this.rolSeleccionado == null) return;
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
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(this.rolSeleccionado);
        console.log("envio al service, id usuario: ", this.idUsuario, " id de rol: ", this.rolSeleccionado)
        this.usuarioService.modificarRol(this.idUsuario, this.rolSeleccionado!).subscribe({
          next: () => {
            this.modalRef.close('rolModificado');
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El rol fue modificado exitosamente",
              timer: 3000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al modificar rol', error);

            // ⚠️ Caso controlado por el backend
            if (error.message === "El rol ingresado no pertenece a la categoria de roles del usuario") {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "El rol seleccionado no pertenece a la categoría de roles del usuario",
                timer: 3000,
                showConfirmButton: false,
              });
            } 
            // ❌ Error genérico o desconocido
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error al modificar el rol',
                text: 'Ocurrió un error inesperado al intentar modificar el rol. Intente nuevamente.',
                confirmButtonColor: '#FF5252'
              });
            }
          }
        });           
      }
    })
  }

  dismissModal() {
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
        this.modalService.dismissActiveModal();
    }});
  }
  
}
