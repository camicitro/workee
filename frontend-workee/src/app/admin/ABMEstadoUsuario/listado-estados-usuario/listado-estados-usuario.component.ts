import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EstadoUsuarioService } from '../estado-usuario.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { CrearEstadoUsuarioComponent } from '../crear-estado-usuario/crear-estado-usuario.component';
import { ModificarEstadoUsuarioComponent } from '../modificar-estado-usuario/modificar-estado-usuario.component';
import { EstadoUsuario } from '../estado-usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-estados-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-estados-usuario.component.html',
  styleUrl: './listado-estados-usuario.component.css'
})
export class ListadoEstadosUsuarioComponent {
  estadoList: EstadoUsuario[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private estadoUsuarioService: EstadoUsuarioService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router

  ) {}

  ngOnInit(): void {    
    this.estadoUsuarioService.findAll().subscribe(estados => {
      this.estadoList = estados;
    });

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de EstadoUsuario
  crearEstadoUsuario() {
    this.modalRef = this.modalService.open(CrearEstadoUsuarioComponent, {
      centered: true,
    });
  }
  
  // Modificacion de EstadoUsuario
  modificarEstadoUsuario(idEstadoUsuario: number) {
    this.estadoUsuarioService.setId(idEstadoUsuario);
    this.modalRef = this.modalService.open(ModificarEstadoUsuarioComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de EstadoUsuario
  habilitarEstadoUsuario(idEstadoUsuario: number) {
    Swal.fire({
      text: "¿Desea habilitar el parámetro?",
      icon: "success",
      iconColor: "#70DC73",
      showCancelButton: true,
      confirmButtonColor: "#70DC73",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.estadoUsuarioService.habilitar(idEstadoUsuario).subscribe({
          next: (response) => {
          this.recargar();
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
          Toast.fire({
            icon: "success",
            title: "Estado de usuario habilitado correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de Estado de usuario
  deshabilitarEstadoUsuario(idEstadoUsuario: number) {
      Swal.fire({
      text: "¿Desea deshabilitar el parámetro?",
      icon: "error",
      iconColor: "#FF5252",
      showCancelButton: true,
      confirmButtonColor: "#FF5252",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.estadoUsuarioService.deshabilitar(idEstadoUsuario).subscribe({
          next: (response) => {
            this.recargar();
            const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
          });
          Toast.fire({
            icon: "success",
            title: "Estado de usuario deshabilitado correctamente",
          });
          },
          error: (error) => {
            if(error.error.message === "La entidad se encuentra en uso, no puede deshabilitarla") {
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
              });
              Toast.fire({
                icon: "warning",
                title: "La entidad se encuentra en uso, no puede deshabilitarla",
              });
            }
          }
        })
    }});
  }

  recargar(): void {
    this.estadoUsuarioService.findAll().subscribe(estados => {
      this.estadoList = estados;
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.estadoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerEstadosPaginados(): EstadoUsuario[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.estadoList.slice(inicio, fin);
  }

  avanzarPagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
  
  retrocederPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  get paginasMostradas(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      if (actual > 3) {
        paginas.push('...');
      }

      const start = Math.max(2, actual - 1);
      const end = Math.min(total - 1, actual + 1);

      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }

      if (actual < total - 2) {
        paginas.push('...');
      }

      paginas.push(total);
    }

    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }


}
