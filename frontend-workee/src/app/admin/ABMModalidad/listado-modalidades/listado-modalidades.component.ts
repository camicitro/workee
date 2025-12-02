import { Component } from '@angular/core';
import { Modalidad } from '../modalidad';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { ModalidadService } from '../modalidad.service';
import { CrearModalidadComponent } from '../crear-modalidad/crear-modalidad.component';
import { ModificarModalidadComponent } from '../modificar-modalidad/modificar-modalidad.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-modalidad',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-modalidades.component.html',
  styleUrl: './listado-modalidades.component.css'
})
export class ListadoModalidadesComponent {
  modalidadList: Modalidad[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private modalidadService: ModalidadService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router

  ) {}

  ngOnInit(): void {    
    this.modalidadService.findAll().subscribe(modalidades => {
      this.modalidadList = modalidades;
    });


    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de Modalidad
  crearModalidad() {
    this.modalRef = this.modalService.open(CrearModalidadComponent, {
      centered: true,
    });
  }
  
  // Modificacion de Modalidad
  modificarModalidad(idModalidad: number) {
    this.modalidadService.setId(idModalidad);
    this.modalRef = this.modalService.open(ModificarModalidadComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de Modalidad
  habilitarModalidad(idModalidad: number) {
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
        this.modalidadService.habilitar(idModalidad).subscribe({
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
            title: "Modalidad habilitada correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de Modalidad
  deshabilitarModalidad(idModalidad: number) {
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
        this.modalidadService.deshabilitar(idModalidad).subscribe({
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
            title: "Modalidad deshabilitada correctamente",
          });
          },
          error: (error) => {
            if(error.error.message === "La entidad se encuentra en uso, no puede deshabilitarla") {
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
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
    this.modalidadService.findAll().subscribe(modalidades => {
      this.modalidadList = modalidades;
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.modalidadList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerModalidadesPaginadas(): Modalidad[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.modalidadList.slice(inicio, fin);
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
