import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearTipoHabilidadComponent } from '../crear-tipo-habilidad/crear-tipo-habilidad.component';
import { ModificarTipoHabilidadComponent } from '../modificar-tipo-habilidad/modificar-tipo-habilidad.component';
import { TipoHabilidad } from '../tipo-habilidad';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { TipoHabilidadService } from '../tipo-habilidad.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-tipos-habilidad',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-tipos-habilidad.component.html',
  styleUrl: './listado-tipos-habilidad.component.css'
})
export class ListadoTiposHabilidadComponent {
  tipoList: TipoHabilidad[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private tipoHabilidadService: TipoHabilidadService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router
  ) {}

  ngOnInit(): void {    
    this.tipoHabilidadService.findAll().subscribe(tipos => {
      this.tipoList = tipos;
    });


    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de TipoHabilidad
  crearTipoHabilidad() {
    this.modalRef = this.modalService.open(CrearTipoHabilidadComponent, {
      centered: true,
    });
  }
  
  // Modificacion de TipoHabilidad
  modificarTipoHabilidad(idTipoHabilidad: number) {
    this.tipoHabilidadService.setId(idTipoHabilidad);
    this.modalRef = this.modalService.open(ModificarTipoHabilidadComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de TipoHabilidad
  habilitarTipoHabilidad(idTipoHabilidad: number) {
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
        this.tipoHabilidadService.habilitar(idTipoHabilidad).subscribe({
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
            title: "Tipo de habilidad habilitado correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de idTipoHabilidad
  deshabilitarTipoHabilidad(idTipoHabilidad: number) {
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
        this.tipoHabilidadService.deshabilitar(idTipoHabilidad).subscribe({
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
            title: "Tipo de habilidad deshabilitado correctamente",
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
    this.tipoHabilidadService.findAll().subscribe(tipos => {
      this.tipoList = tipos;
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.tipoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerTiposPaginados(): TipoHabilidad[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.tipoList.slice(inicio, fin);
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