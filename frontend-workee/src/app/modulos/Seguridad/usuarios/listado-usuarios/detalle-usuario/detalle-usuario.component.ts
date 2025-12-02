import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../usuario.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../../compartidos/modal/modal.service';
import { ModificarRolUsuarioComponent } from './modificar-rol-usuario/modificar-rol-usuario.component';
import Swal from 'sweetalert2';
import { UsuarioListadoDTO } from '../usuario-listado-dto';

@Component({
  selector: 'app-detalle-usuario',
  imports: [],
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.css'
})
export class DetalleUsuarioComponent implements OnInit {
  
  idUsuario!: number;
  usuario: UsuarioListadoDTO = {};
  modalRef?: NgbModalRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private usuarioService: UsuarioService,
  ) {}
  
  ngOnInit(): void {
    this.cargarUsuario();
  }
  
  cargarUsuario() {
    // se saca esta logica fuera del ngOnInit para reutilizarla cuando se vuelve del detalle
    this.idUsuario = Number(this.route.snapshot.paramMap.get('idUsuario'));
    
    this.usuarioService.findById(this.idUsuario).subscribe({
      next: data => {
        this.usuario = data;
      },
      error: err => {
        console.error('Error al obtener usuario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar el usuario',
          text: 'No se pudo obtener la información del usuario. Intente nuevamente.',
          confirmButtonColor: '#FF5252'
        }).then(() => {
          this.volverAListado(); 
        });
      }
    });

  }

  volverAListado() {
    this.router.navigate([`usuarios`]);
  }

  eliminarCuenta() {
    Swal.fire({
      title: '¿Desea eliminar el usuario?',
      text: 'Esta acción no se puede deshacer.',
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
        this.usuarioService.eliminarUsuario(this.idUsuario).subscribe({
          next: (mensaje) => {
            console.log(mensaje);
            this.volverAListado();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El usuario ha sido eliminado exitosamente",
              timer: 3000,
              showConfirmButton: false,
            })
          },
          error: (error) => {
            console.error('Error al eliminar usuario', error);
            if (error.message === "El usuario ya se encuentra dado de baja") {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "El usuario ya se encuentra dado de baja",
                timer: 3000,
                showConfirmButton: false,
              })
            } else {
              Swal.fire({
                icon: "error",
                title: "Error al eliminar usuario",
                text: "Ocurrió un error inesperado. Intente nuevamente más tarde.",
                confirmButtonColor: "#FF5252"
              });
            }
          }
        })
      }
    });
  }

  modificarRol() {
    this.modalRef = this.modalService.open(ModificarRolUsuarioComponent, {
      centered: false,
    });
    this.modalRef.componentInstance.idUsuario = this.usuario.idUsuario;
    this.modalRef.componentInstance.usuario = this.usuario;
    this.modalRef.componentInstance.modalRef = this.modalRef;
    this.modalRef.closed.subscribe((result) => {
      console.log(result)
      if (result === 'rolModificado') {
        console.log("volvi al detalle, deberia cerrarme")
        this.cargarUsuario();
      }
    })
  }

}
